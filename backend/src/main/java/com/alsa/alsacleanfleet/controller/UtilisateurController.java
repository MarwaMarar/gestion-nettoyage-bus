package com.alsa.alsacleanfleet.controller;

import com.alsa.alsacleanfleet.entity.Utilisateur;
import com.alsa.alsacleanfleet.repository.UtilisateurRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
@CrossOrigin(origins = "http://localhost:4200")
public class UtilisateurController {


    private final UtilisateurRepository utilisateurRepository;


    public UtilisateurController(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }


    // Afficher tous les utilisateurs
    @GetMapping
    public List<Utilisateur> getAllUtilisateurs() {
        return utilisateurRepository.findAll();
    }


    // Ajouter un utilisateur
    @PostMapping
    public Utilisateur ajouterUtilisateur(@RequestBody Utilisateur utilisateur) {
        return utilisateurRepository.save(utilisateur);
    }


    // Modifier un utilisateur
    @PutMapping("/{id}")
    public Utilisateur modifierUtilisateur(
            @PathVariable Long id,
            @RequestBody Utilisateur utilisateur) {

        utilisateur.setActif(true);
        return utilisateurRepository.save(utilisateur);
    }


    // Désactiver un utilisateur
    @DeleteMapping("/{id}")
    public void supprimerUtilisateur(@PathVariable Long id) {

        utilisateurRepository.deleteById(id);

    }
}