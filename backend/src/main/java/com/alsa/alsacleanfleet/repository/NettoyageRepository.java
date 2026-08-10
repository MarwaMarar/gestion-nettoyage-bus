package com.alsa.alsacleanfleet.repository;

import com.alsa.alsacleanfleet.entity.Nettoyage;
import com.alsa.alsacleanfleet.enums.StatutNettoyage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface NettoyageRepository extends JpaRepository<Nettoyage, Long>, JpaSpecificationExecutor<Nettoyage> {

    @Override
    @EntityGraph(attributePaths = {"bus", "typeNettoyage", "nettoyeur", "superviseur"})
    Page<Nettoyage> findAll(Specification<Nettoyage> specification, Pageable pageable);

    List<Nettoyage> findByBusId(Long busId);
    List<Nettoyage> findByBusIdOrderByDateNettoyageDescIdDesc(Long busId);
    List<Nettoyage> findByBusIdAndTypeNettoyageIdOrderByDateNettoyageAsc(Long busId, Long typeNettoyageId);
    boolean existsByBusIdAndTypeNettoyageIdAndDateNettoyage(Long busId, Long typeNettoyageId, LocalDate date);
    boolean existsByBusIdAndTypeNettoyageIdAndDateNettoyageAndIdNot(
            Long busId, Long typeNettoyageId, LocalDate date, Long id);
    boolean existsByTypeNettoyageId(Long typeNettoyageId);

    List<Nettoyage> findByNettoyeurId(Long nettoyeurId);
    List<Nettoyage> findByNettoyeurIdOrderByDateNettoyageDescHeureDebutDesc(Long nettoyeurId);
    boolean existsByNettoyeurIdAndStatutAndHeureDebutIsNotNullAndHeureFinIsNull(
            Long nettoyeurId,
            StatutNettoyage statut
    );

    List<Nettoyage> findByStatut(StatutNettoyage statut);
    List<Nettoyage> findByStatutOrderByHeureFinAsc(StatutNettoyage statut);
    List<Nettoyage> findByStatutAndHeureFinIsNotNullOrderByHeureFinAsc(StatutNettoyage statut);

    @Query("SELECT n FROM Nettoyage n WHERE n.statut = :statut AND n.heureFin IS NOT NULL "
            + "AND (n.superviseur IS NULL OR n.superviseur.id = :superviseurId) "
            + "ORDER BY n.heureFin ASC")
    List<Nettoyage> findPendingVisibleToSupervisor(StatutNettoyage statut, Long superviseurId);

    List<Nettoyage> findByDateNettoyageBetween(LocalDate debut, LocalDate fin);
    List<Nettoyage> findBySuperviseurId(Long superviseurId);

    @Query("SELECT COUNT(n) FROM Nettoyage n WHERE n.statut = :statut")
    long countByStatut(StatutNettoyage statut);

    @Query("SELECT COUNT(n) FROM Nettoyage n WHERE n.dateNettoyage = :date")
    long countByDateNettoyage(LocalDate date);
}
