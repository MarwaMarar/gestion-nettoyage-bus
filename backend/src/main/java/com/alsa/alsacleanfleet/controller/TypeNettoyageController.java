package com.alsa.alsacleanfleet.controller;

import com.alsa.alsacleanfleet.entity.TypeNettoyage;
import com.alsa.alsacleanfleet.service.TypeNettoyageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/types-nettoyage")
public class TypeNettoyageController {
    private final TypeNettoyageService service;
    public TypeNettoyageController(TypeNettoyageService service) { this.service = service; }
    @GetMapping public List<TypeNettoyage> getAll() { return service.findAll(); }
    @GetMapping("/{id}") public ResponseEntity<TypeNettoyage> getById(@PathVariable Long id) { return service.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build()); }
    @PostMapping public TypeNettoyage create(@RequestBody TypeNettoyage type) { return service.create(type); }
    @PutMapping("/{id}") public ResponseEntity<TypeNettoyage> update(@PathVariable Long id, @RequestBody TypeNettoyage type) {
        return service.update(id, type).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) {
        return service.delete(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
