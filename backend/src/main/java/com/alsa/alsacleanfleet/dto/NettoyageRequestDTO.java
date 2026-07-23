package com.alsa.alsacleanfleet.dto;
import com.alsa.alsacleanfleet.enums.StatutNettoyage;
import jakarta.validation.constraints.*;
import java.time.*;
public record NettoyageRequestDTO(@NotNull Long busId, @NotNull Long typeNettoyageId, @NotNull Long nettoyeurId,
 Long superviseurId, @NotNull LocalDate dateNettoyage, LocalDateTime heureDebut, LocalDateTime heureFin,
 @Positive Integer duree, String remarqueNettoyeur, String remarqueSuperviseur,
 @NotNull StatutNettoyage statut, LocalDateTime dateValidation) {}
