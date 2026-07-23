package com.alsa.alsacleanfleet.dto;
import com.alsa.alsacleanfleet.enums.Role;
import jakarta.validation.constraints.*;
public record UtilisateurRequestDTO(@NotBlank String nom, @NotBlank String prenom, @NotBlank String matricule,
 String telephone, @NotBlank @Email String email, @NotBlank String login, String motDePasse,
 @NotNull Role role, Boolean actif) {}
