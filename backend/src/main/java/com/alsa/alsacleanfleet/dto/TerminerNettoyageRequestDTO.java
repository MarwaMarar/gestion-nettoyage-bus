package com.alsa.alsacleanfleet.dto;

import jakarta.validation.constraints.Size;

public record TerminerNettoyageRequestDTO(
        @Size(max = 2000) String remarqueNettoyeur
) {}
