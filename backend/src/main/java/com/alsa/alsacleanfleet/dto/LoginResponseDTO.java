package com.alsa.alsacleanfleet.dto;

public record LoginResponseDTO(
        String accessToken,
        String tokenType,
        long expiresIn,
        AuthenticatedUserDTO utilisateur
) {}
