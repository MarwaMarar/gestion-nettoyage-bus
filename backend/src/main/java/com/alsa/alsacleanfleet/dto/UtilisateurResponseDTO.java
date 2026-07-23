package com.alsa.alsacleanfleet.dto;
import com.alsa.alsacleanfleet.enums.Role;
public record UtilisateurResponseDTO(Long id, String nom, String prenom, String matricule, String telephone,
 String email, String login, Role role, Boolean actif) {}
