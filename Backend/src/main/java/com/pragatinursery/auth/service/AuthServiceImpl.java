package com.pragatinursery.auth.service;

import com.pragatinursery.auth.dto.request.LoginRequest;
import com.pragatinursery.auth.dto.request.RegisterRequest;
import com.pragatinursery.auth.dto.response.AuthResponse;
import com.pragatinursery.auth.dto.response.UserResponse;
import com.pragatinursery.auth.entity.RefreshToken;
import com.pragatinursery.auth.entity.User;
import com.pragatinursery.auth.repository.RefreshTokenRepository;
import com.pragatinursery.auth.repository.UserRepository;
import com.pragatinursery.common.enums.UserRole;
import com.pragatinursery.common.enums.UserStatus;
import com.pragatinursery.common.exception.DuplicateResourceException;
import com.pragatinursery.common.exception.ForbiddenException;
import com.pragatinursery.common.exception.UnauthorizedException;
import com.pragatinursery.security.CookieUtils;
import com.pragatinursery.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final CookieUtils cookieUtils;

    @Value("${app.jwt.refresh-token-expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request, HttpServletResponse response) {
        String cleanEmail = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new DuplicateResourceException("An account with email '" + cleanEmail + "' already exists.");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(cleanEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.ROLE_CUSTOMER) // STRICTLY HARDCODED - Client cannot choose role
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Registered new customer: {}", savedUser.getEmail());

        String accessToken = tokenProvider.generateToken(savedUser);
        RefreshToken refreshToken = createRefreshToken(savedUser);

        ResponseCookie cookie = cookieUtils.createRefreshTokenCookie(refreshToken.getToken());
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .user(mapToUserResponse(savedUser))
                .build();
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        String cleanEmail = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ForbiddenException("Your account is currently inactive. Please contact support.");
        }

        log.info("User logged in successfully: {}", user.getEmail());

        String accessToken = tokenProvider.generateToken(user);
        
        // Rotate refresh token
        refreshTokenRepository.deleteByUser(user);
        RefreshToken refreshToken = createRefreshToken(user);

        ResponseCookie cookie = cookieUtils.createRefreshTokenCookie(refreshToken.getToken());
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .user(mapToUserResponse(user))
                .build();
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshTokenStr = cookieUtils.getRefreshTokenFromCookies(request)
                .orElseThrow(() -> new UnauthorizedException("Refresh token cookie is missing. Please log in again."));

        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenStr)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token. Please log in again."));

        if (refreshToken.isRevoked() || refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            ResponseCookie cleanCookie = cookieUtils.getCleanRefreshTokenCookie();
            response.addHeader(HttpHeaders.SET_COOKIE, cleanCookie.toString());
            throw new UnauthorizedException("Refresh token is expired or invalid. Please log in again.");
        }

        User user = refreshToken.getUser();
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ForbiddenException("Your account is currently inactive.");
        }

        // Refresh token rotation
        refreshTokenRepository.delete(refreshToken);
        RefreshToken newRefreshToken = createRefreshToken(user);

        ResponseCookie newCookie = cookieUtils.createRefreshTokenCookie(newRefreshToken.getToken());
        response.addHeader(HttpHeaders.SET_COOKIE, newCookie.toString());

        String newAccessToken = tokenProvider.generateToken(user);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .tokenType("Bearer")
                .user(mapToUserResponse(user))
                .build();
    }

    @Override
    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        cookieUtils.getRefreshTokenFromCookies(request).ifPresent(tokenStr -> {
            refreshTokenRepository.findByToken(tokenStr).ifPresent(refreshTokenRepository::delete);
        });

        ResponseCookie cleanCookie = cookieUtils.getCleanRefreshTokenCookie();
        response.addHeader(HttpHeaders.SET_COOKIE, cleanCookie.toString());
        log.info("User logged out and refresh cookie cleared.");
    }

    @Override
    public UserResponse getCurrentUser(User currentUser) {
        return mapToUserResponse(currentUser);
    }

    private RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshTokenExpirationMs))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
