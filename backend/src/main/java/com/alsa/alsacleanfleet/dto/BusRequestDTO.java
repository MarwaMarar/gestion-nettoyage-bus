package com.alsa.alsacleanfleet.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
public record BusRequestDTO(@NotBlank String numeroBus, @NotNull Long typeBusId, Boolean actif) {}
