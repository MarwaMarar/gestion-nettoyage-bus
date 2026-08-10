package com.alsa.alsacleanfleet.dto;

import com.alsa.alsacleanfleet.enums.TypeExclusionBus;
import jakarta.validation.constraints.NotNull;

public record BusExclusionRequestDTO(
        @NotNull(message = "Le bus est obligatoire") Long busId,
        @NotNull(message = "Le type d'exclusion est obligatoire") TypeExclusionBus type
) {}
