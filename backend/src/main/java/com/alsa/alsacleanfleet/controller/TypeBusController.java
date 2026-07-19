package com.alsa.alsacleanfleet.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alsa.alsacleanfleet.entity.TypeBus;
import com.alsa.alsacleanfleet.service.TypeBusService;

@RestController
@RequestMapping("/api/types-bus")
public class TypeBusController {

    private final TypeBusService typeBusService;

    public TypeBusController(TypeBusService typeBusService) {
        this.typeBusService = typeBusService;
    }

    @GetMapping
    public List<TypeBus> getAll() {
        return typeBusService.getAllTypes();
    }

    @PostMapping
    public TypeBus ajouter(@RequestBody TypeBus typeBus) {
        return typeBusService.ajouterType(typeBus);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TypeBus> modifier(@PathVariable Long id, @RequestBody TypeBus typeBus) {
        return typeBusService.modifierType(id, typeBus)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        if (typeBusService.supprimerType(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}