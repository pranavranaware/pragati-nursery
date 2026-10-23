package com.pragatinursery.account.service;

import com.pragatinursery.account.dto.request.CreateAddressRequest;
import com.pragatinursery.account.dto.request.UpdateAddressRequest;
import com.pragatinursery.account.dto.response.AddressResponse;
import com.pragatinursery.account.entity.Address;
import com.pragatinursery.account.repository.AddressRepository;
import com.pragatinursery.auth.entity.User;
import com.pragatinursery.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getCustomerAddresses(User user) {
        return addressRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToAddressResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponse getAddressById(User user, Long id) {
        Address address = addressRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));
        return mapToAddressResponse(address);
    }

    @Override
    @Transactional
    public AddressResponse createAddress(User user, CreateAddressRequest request) {
        boolean firstAddress = !addressRepository.existsByUserId(user.getId());
        boolean makeDefault = firstAddress || Boolean.TRUE.equals(request.getIsDefault());

        if (makeDefault) {
            unsetExistingDefault(user.getId());
        }

        Address address = Address.builder()
                .user(user)
                .fullName(request.getFullName().trim())
                .mobile(request.getMobile().trim())
                .email(request.getEmail() != null ? request.getEmail().trim() : user.getEmail())
                .address(request.getAddress().trim())
                .area(request.getArea() != null ? request.getArea().trim() : null)
                .city(request.getCity().trim())
                .district(request.getDistrict() != null ? request.getDistrict().trim() : null)
                .state(request.getState().trim())
                .pincode(request.getPincode().trim())
                .landmark(request.getLandmark() != null ? request.getLandmark().trim() : null)
                .isDefault(makeDefault)
                .build();

        Address savedAddress = addressRepository.save(address);
        log.info("Created address ID {} for user {}", savedAddress.getId(), user.getEmail());
        return mapToAddressResponse(savedAddress);
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(User user, Long id, UpdateAddressRequest request) {
        Address address = addressRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));

        boolean makeDefault = Boolean.TRUE.equals(request.getIsDefault());
        if (makeDefault && !address.isDefault()) {
            unsetExistingDefault(user.getId());
            address.setDefault(true);
        }

        address.setFullName(request.getFullName().trim());
        address.setMobile(request.getMobile().trim());
        if (request.getEmail() != null) address.setEmail(request.getEmail().trim());
        address.setAddress(request.getAddress().trim());
        if (request.getArea() != null) address.setArea(request.getArea().trim());
        address.setCity(request.getCity().trim());
        if (request.getDistrict() != null) address.setDistrict(request.getDistrict().trim());
        address.setState(request.getState().trim());
        address.setPincode(request.getPincode().trim());
        if (request.getLandmark() != null) address.setLandmark(request.getLandmark().trim());

        Address updatedAddress = addressRepository.save(address);
        log.info("Updated address ID {} for user {}", updatedAddress.getId(), user.getEmail());
        return mapToAddressResponse(updatedAddress);
    }

    @Override
    @Transactional
    public AddressResponse setDefaultAddress(User user, Long id) {
        Address address = addressRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));

        if (!address.isDefault()) {
            unsetExistingDefault(user.getId());
            address.setDefault(true);
            addressRepository.save(address);
            log.info("Set address ID {} as default for user {}", id, user.getEmail());
        }

        return mapToAddressResponse(address);
    }

    @Override
    @Transactional
    public void deleteAddress(User user, Long id) {
        Address address = addressRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));

        boolean wasDefault = address.isDefault();
        addressRepository.delete(address);
        log.info("Deleted address ID {} for user {}", id, user.getEmail());

        if (wasDefault) {
            List<Address> remaining = addressRepository.findByUserId(user.getId());
            if (!remaining.isEmpty()) {
                Address newDefault = remaining.get(0);
                newDefault.setDefault(true);
                addressRepository.save(newDefault);
                log.info("Promoted address ID {} as new default for user {}", newDefault.getId(), user.getEmail());
            }
        }
    }

    private void unsetExistingDefault(Long userId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId).ifPresent(existingDefault -> {
            existingDefault.setDefault(false);
            addressRepository.save(existingDefault);
        });
    }

    private AddressResponse mapToAddressResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .mobile(address.getMobile())
                .email(address.getEmail())
                .address(address.getAddress())
                .area(address.getArea())
                .city(address.getCity())
                .district(address.getDistrict())
                .state(address.getState())
                .pincode(address.getPincode())
                .landmark(address.getLandmark())
                .isDefault(address.isDefault())
                .build();
    }
}
