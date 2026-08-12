package com.alsa.alsacleanfleet.controller;

import com.alsa.alsacleanfleet.dto.*;
import com.alsa.alsacleanfleet.enums.StatutNettoyage;
import com.alsa.alsacleanfleet.security.AuthenticatedUser;
import com.alsa.alsacleanfleet.service.NettoyageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/nettoyages")
public class NettoyageController {
    private final NettoyageService service;

    public NettoyageController(NettoyageService service) {
        this.service = service;
    }

    @GetMapping
    public List<NettoyageResponseDTO> all() {
        return service.findAll();
    }

    @GetMapping("/statistiques")
    public Map<String, Long> statistics() {
        return service.statistics();
    }

    @PostMapping("/commencer")
    public ResponseEntity<NettoyageResponseDTO> commencer(
            @Valid @RequestBody CommencerNettoyageRequestDTO request,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.commencer(request, principal));
    }

    @PutMapping("/{id}/terminer")
    public NettoyageResponseDTO terminer(
            @PathVariable Long id,
            @Valid @RequestBody TerminerNettoyageRequestDTO request,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return service.terminer(id, request, principal);
    }

    @GetMapping("/mes-nettoyages")
    public List<NettoyageResponseDTO> mesNettoyages(
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return service.mesNettoyages(principal);
    }

    @GetMapping("/en-attente")
    public List<NettoyageResponseDTO> enAttente(
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return service.enAttente(principal);
    }

    @GetMapping("/admin/nettoyeur/page")
    public Page<NettoyageResponseDTO> adminCleanerPage(
            @RequestParam Long userId, @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) Long busId,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return service.adminCleanerPage(principal, userId, dateDebut, dateFin, busId, PageRequest.of(page, size,
                Sort.by(Sort.Order.desc("dateNettoyage"), Sort.Order.desc("heureDebut"), Sort.Order.desc("id"))));
    }

    @GetMapping("/admin/superviseur/page")
    public Page<NettoyageResponseDTO> adminSupervisorPage(
            @RequestParam Long userId, @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) Long busId,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return service.adminSupervisorPage(principal, userId, dateDebut, dateFin, busId, PageRequest.of(page, size,
                Sort.by(Sort.Order.desc("dateNettoyage"), Sort.Order.desc("heureFin"), Sort.Order.desc("id"))));
    }

    @GetMapping("/admin/planification/page")
    public Page<NettoyageResponseDTO> planningPage(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long busId,
            @RequestParam(required = false) Long typeId,
            @RequestParam(required = false) StatutNettoyage statut,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return service.planningPage(principal, date, busId, typeId, statut,
                PageRequest.of(page, size, Sort.by(Sort.Order.asc("bus.numeroBus"), Sort.Order.asc("id"))));
    }

    @GetMapping("/admin/planification/export")
    public List<NettoyageResponseDTO> planningExport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long busId,
            @RequestParam(required = false) Long typeId,
            @RequestParam(required = false) StatutNettoyage statut,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return service.planningExport(principal, date, busId, typeId, statut);
    }

    @PutMapping("/{id}/valider")
    public NettoyageResponseDTO valider(
            @PathVariable Long id,
            @Valid @RequestBody DecisionNettoyageRequestDTO request,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return service.valider(id, request, principal);
    }

    @PutMapping("/{id}/refuser")
    public NettoyageResponseDTO refuser(
            @PathVariable Long id,
            @Valid @RequestBody DecisionNettoyageRequestDTO request,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return service.refuser(id, request, principal);
    }

    @GetMapping("/{id}")
    public NettoyageResponseDTO one(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return service.findByIdForUser(id, principal);
    }

    @PostMapping
    public ResponseEntity<NettoyageResponseDTO> add(
            @Valid @RequestBody NettoyageRequestDTO request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    public NettoyageResponseDTO edit(
            @PathVariable Long id,
            @Valid @RequestBody NettoyageRequestDTO request
    ) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
