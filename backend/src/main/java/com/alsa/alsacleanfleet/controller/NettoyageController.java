package com.alsa.alsacleanfleet.controller;

import com.alsa.alsacleanfleet.entity.Nettoyage;
import com.alsa.alsacleanfleet.enums.StatutNettoyage;
import com.alsa.alsacleanfleet.repository.NettoyageRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nettoyages")
@CrossOrigin(origins = "http://localhost:4200")
public class NettoyageController {

    private final NettoyageRepository nettoyageRepository;

    public NettoyageController(NettoyageRepository nettoyageRepository) {
        this.nettoyageRepository = nettoyageRepository;
    }

    @GetMapping
    public List<Nettoyage> getAll() {
        return nettoyageRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Nettoyage> getById(@PathVariable Long id) {
        return nettoyageRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/bus/{busId}")
    public List<Nettoyage> getByBus(@PathVariable Long busId) {
        return nettoyageRepository.findByBusId(busId);
    }

    @GetMapping("/nettoyeur/{nettoyeurId}")
    public List<Nettoyage> getByNettoyeur(@PathVariable Long nettoyeurId) {
        return nettoyageRepository.findByNettoyeurId(nettoyeurId);
    }

    @GetMapping("/statut/{statut}")
    public List<Nettoyage> getByStatut(@PathVariable StatutNettoyage statut) {
        return nettoyageRepository.findByStatut(statut);
    }

    @GetMapping("/periode")
    public List<Nettoyage> getByPeriode(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return nettoyageRepository.findByDateBetween(debut, fin);
    }

    @GetMapping("/statistiques")
    public Map<String, Object> getStatistiques() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", nettoyageRepository.count());
        stats.put("enAttente", nettoyageRepository.countByStatut(StatutNettoyage.EN_ATTENTE));
        stats.put("valides", nettoyageRepository.countByStatut(StatutNettoyage.VALIDE));
        stats.put("refuses", nettoyageRepository.countByStatut(StatutNettoyage.REFUSE));
        stats.put("aujourdHui", nettoyageRepository.countByDate(LocalDate.now()));
        return stats;
    }

    @PostMapping
    public Nettoyage ajouter(@RequestBody Nettoyage nettoyage) {
        if (nettoyage.getStatut() == null) {
            nettoyage.setStatut(StatutNettoyage.EN_ATTENTE);
        }
        if (nettoyage.getDate() == null) {
            nettoyage.setDate(LocalDate.now());
        }
        return nettoyageRepository.save(nettoyage);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Nettoyage> modifier(@PathVariable Long id, @RequestBody Nettoyage nettoyage) {
        return nettoyageRepository.findById(id)
                .map(existing -> {
                    existing.setBus(nettoyage.getBus());
                    existing.setTypeNettoyage(nettoyage.getTypeNettoyage());
                    existing.setNettoyeur(nettoyage.getNettoyeur());
                    existing.setSuperviseur(nettoyage.getSuperviseur());
                    existing.setDate(nettoyage.getDate());
                    existing.setHeureDebut(nettoyage.getHeureDebut());
                    existing.setHeureFin(nettoyage.getHeureFin());
                    existing.setDuree(nettoyage.getDuree());
                    existing.setRemarqueNettoyeur(nettoyage.getRemarqueNettoyeur());
                    existing.setRemarqueSuperviseur(nettoyage.getRemarqueSuperviseur());
                    existing.setStatut(nettoyage.getStatut());
                    existing.setDateValidation(nettoyage.getDateValidation());
                    return ResponseEntity.ok(nettoyageRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        nettoyageRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
