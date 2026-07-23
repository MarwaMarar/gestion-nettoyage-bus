package com.alsa.alsacleanfleet.dto;
import com.alsa.alsacleanfleet.enums.StatutNettoyage;
import java.time.*;
public record NettoyageResponseDTO(Long id, Long busId, String numeroBus, Long typeNettoyageId,
 String typeNettoyageLibelle, Long nettoyeurId, String nettoyeurNom, Long superviseurId,
 String superviseurNom, LocalDate dateNettoyage, LocalDateTime heureDebut, LocalDateTime heureFin,
 Integer duree, String remarqueNettoyeur, String remarqueSuperviseur, StatutNettoyage statut,
 LocalDateTime dateValidation) {}
