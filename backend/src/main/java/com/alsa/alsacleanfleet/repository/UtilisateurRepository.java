package com.alsa.alsacleanfleet.repository;

import com.alsa.alsacleanfleet.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
 boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
 boolean existsByLoginIgnoreCaseAndIdNot(String login, Long id);
 boolean existsByMatriculeIgnoreCaseAndIdNot(String matricule, Long id);
 java.util.List<Utilisateur> findByActifTrue();
}
