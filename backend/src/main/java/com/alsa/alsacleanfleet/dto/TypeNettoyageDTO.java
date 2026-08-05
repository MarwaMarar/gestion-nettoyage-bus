package com.alsa.alsacleanfleet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TypeNettoyageDTO(
        Long id,
        @NotBlank(message = "Le libellé est obligatoire")
        @Size(max = 100, message = "Le libellé ne doit pas dépasser 100 caractères")
        String libelle,
        String description,
        @NotBlank(message = "La frequence est obligatoire")
        @Size(max = 100, message = "La frequence ne doit pas depasser 100 caracteres")
        String frequence
) {}
