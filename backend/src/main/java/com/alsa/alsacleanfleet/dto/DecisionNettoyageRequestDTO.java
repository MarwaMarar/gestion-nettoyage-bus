package com.alsa.alsacleanfleet.dto;

import jakarta.validation.constraints.Size;

public record DecisionNettoyageRequestDTO(
        @Size(max = 2000) String remarqueSuperviseur
) {}
