package com.alsa.alsacleanfleet.repository;

import com.alsa.alsacleanfleet.entity.TypeNettoyage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TypeNettoyageRepository extends JpaRepository<TypeNettoyage, Long> {
    boolean existsByLibelleIgnoreCase(String libelle);
    boolean existsByLibelleIgnoreCaseAndIdNot(String libelle, Long id);
}
