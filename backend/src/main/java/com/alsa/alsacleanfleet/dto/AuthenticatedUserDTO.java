package com.alsa.alsacleanfleet.dto;

import com.alsa.alsacleanfleet.enums.Role;

public record AuthenticatedUserDTO(
        Long id,
        String nom,
        String prenom,
        String matricule,
        String email,
        String login,
        Role role,
        Boolean actif,
        Boolean mustChangePassword
) {}
