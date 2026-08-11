package com.alsa.alsacleanfleet.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateOwnPasswordRequestDTO(@NotBlank String currentPassword,
        @NotBlank String newPassword, @NotBlank String confirmPassword) {}
