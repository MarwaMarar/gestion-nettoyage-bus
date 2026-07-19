package com.alsa.alsacleanfleet.controller;

import com.alsa.alsacleanfleet.entity.Bus;
import com.alsa.alsacleanfleet.repository.BusRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bus")
@CrossOrigin(origins = "http://localhost:4200")
public class BusController {

    private final BusRepository busRepository;

    public BusController(BusRepository busRepository) {
        this.busRepository = busRepository;
    }

    @GetMapping
    public List<Bus> getAll() {
        return busRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bus> getById(@PathVariable Long id) {
        return busRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Bus ajouter(@RequestBody Bus bus) {
        return busRepository.save(bus);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bus> modifier(@PathVariable Long id, @RequestBody Bus bus) {
        return busRepository.findById(id)
                .map(existing -> {
                    existing.setNumeroBus(bus.getNumeroBus());
                    existing.setImmatriculation(bus.getImmatriculation());
                    existing.setTypeBus(bus.getTypeBus());
                    existing.setActif(bus.getActif());
                    return ResponseEntity.ok(busRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        busRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
