package com.alsa.alsacleanfleet.repository;

import com.alsa.alsacleanfleet.entity.Nettoyage;
import com.alsa.alsacleanfleet.enums.StatutNettoyage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface NettoyageRepository extends JpaRepository<Nettoyage, Long> {

    List<Nettoyage> findByBusId(Long busId);

    List<Nettoyage> findByNettoyeurId(Long nettoyeurId);

    List<Nettoyage> findByStatut(StatutNettoyage statut);

    List<Nettoyage> findByDateNettoyageBetween(LocalDate debut, LocalDate fin);
    List<Nettoyage> findBySuperviseurId(Long superviseurId);

    @Query("SELECT COUNT(n) FROM Nettoyage n WHERE n.statut = :statut")
    long countByStatut(StatutNettoyage statut);

    @Query("SELECT COUNT(n) FROM Nettoyage n WHERE n.dateNettoyage = :date")
    long countByDateNettoyage(LocalDate date);
}
