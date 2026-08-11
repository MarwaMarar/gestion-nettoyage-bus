package com.alsa.alsacleanfleet.controller;

import com.alsa.alsacleanfleet.dto.TypeNettoyageDTO;
import com.alsa.alsacleanfleet.service.TypeNettoyageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/types-nettoyage")
public class TypeNettoyageController {
    private final TypeNettoyageService service;
    public TypeNettoyageController(TypeNettoyageService service) { this.service = service; }
    @GetMapping public List<TypeNettoyageDTO> getAll() { return service.findAll(); }
    @GetMapping("/{id}") public ResponseEntity<TypeNettoyageDTO> getById(@PathVariable Long id) { return service.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build()); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public TypeNettoyageDTO create(@Valid @RequestBody TypeNettoyageDTO type) { return service.create(type); }
    @PutMapping("/{id}") public TypeNettoyageDTO update(@PathVariable Long id, @Valid @RequestBody TypeNettoyageDTO type) { return service.update(id, type); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
