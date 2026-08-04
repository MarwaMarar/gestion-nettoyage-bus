package com.alsa.alsacleanfleet.dto;

import jakarta.validation.constraints.NotBlank;

public record ChangePasswordRequestDTO(
        @NotBlank String newPassword,
        @NotBlank String confirmPassword
) {}
