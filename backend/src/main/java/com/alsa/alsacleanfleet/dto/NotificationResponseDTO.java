package com.alsa.alsacleanfleet.dto;
import java.time.LocalDateTime;
public record NotificationResponseDTO(Long id, Long nettoyageId, String message, boolean lue, LocalDateTime dateCreation) {}
