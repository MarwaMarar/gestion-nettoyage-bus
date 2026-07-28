package com.alsa.alsacleanfleet.dto;

import jakarta.validation.constraints.NotNull;

public record CommencerNettoyageRequestDTO(
        @NotNull Long busId,
        @NotNull Long typeNettoyageId
) {}
