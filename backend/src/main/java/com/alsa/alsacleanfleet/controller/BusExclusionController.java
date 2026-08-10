package com.alsa.alsacleanfleet.controller;

import com.alsa.alsacleanfleet.dto.BusExclusionRequestDTO;
import com.alsa.alsacleanfleet.dto.BusExclusionResponseDTO;
import com.alsa.alsacleanfleet.enums.TypeExclusionBus;
import com.alsa.alsacleanfleet.service.BusExclusionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bus-exclusions")
public class BusExclusionController {
    private final BusExclusionService service;

    public BusExclusionController(BusExclusionService service) { this.service = service; }

    @GetMapping
    public List<BusExclusionResponseDTO> all(@RequestParam(required = false) TypeExclusionBus type) {
        return service.findAll(type);
    }

    @PostMapping
    public ResponseEntity<BusExclusionResponseDTO> add(@Valid @RequestBody BusExclusionRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
