package com.alsa.alsacleanfleet.repository;

import com.alsa.alsacleanfleet.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import com.alsa.alsacleanfleet.enums.Role;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
 boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
 boolean existsByLoginIgnoreCaseAndIdNot(String login, Long id);
 boolean existsByMatriculeIgnoreCaseAndIdNot(String matricule, Long id);
 Optional<Utilisateur> findByLoginIgnoreCase(String login);
 Optional<Utilisateur> findByEmailIgnoreCase(String email);
 java.util.List<Utilisateur> findByActifTrue();
 java.util.List<Utilisateur> findByRoleAndActifTrue(Role role);
}
