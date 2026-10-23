package com.pragatinursery.auth.service;

import com.pragatinursery.auth.dto.request.LoginRequest;
import com.pragatinursery.auth.dto.request.RegisterRequest;
import com.pragatinursery.auth.dto.response.AuthResponse;
import com.pragatinursery.auth.dto.response.UserResponse;
import com.pragatinursery.auth.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request, HttpServletResponse response);
    AuthResponse login(LoginRequest request, HttpServletResponse response);
    AuthResponse refreshToken(HttpServletRequest request, HttpServletResponse response);
    void logout(HttpServletRequest request, HttpServletResponse response);
    UserResponse getCurrentUser(User currentUser);
}
