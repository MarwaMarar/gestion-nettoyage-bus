package com.alsa.alsacleanfleet.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(
        @NotBlank String login,
        @NotBlank String motDePasse
) {}
