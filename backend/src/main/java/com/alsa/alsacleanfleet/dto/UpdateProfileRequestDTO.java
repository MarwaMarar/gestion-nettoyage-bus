package com.alsa.alsacleanfleet.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UpdateProfileRequestDTO(@NotBlank String nom, @NotBlank String prenom,
        @NotBlank @Email String email, String telephone) {}
