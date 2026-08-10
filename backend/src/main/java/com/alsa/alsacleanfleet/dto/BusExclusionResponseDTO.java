package com.alsa.alsacleanfleet.dto;

import com.alsa.alsacleanfleet.enums.TypeExclusionBus;

public record BusExclusionResponseDTO(
        Long id,
        Long busId,
        String numeroBus,
        String typeBusLibelle,
        TypeExclusionBus type
) {}
