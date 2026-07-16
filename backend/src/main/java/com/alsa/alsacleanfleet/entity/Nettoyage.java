package com.alsa.alsacleanfleet.entity;

import com.alsa.alsacleanfleet.enums.StatutNettoyage;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "nettoyages")
public class Nettoyage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(name = "bus_id")
    private Bus bus;


    @ManyToOne
    @JoinColumn(name = "type_nettoyage_id")
    private TypeNettoyage typeNettoyage;


    // Le nettoyeur qui a effectué le nettoyage
    @ManyToOne
    @JoinColumn(name = "nettoyeur_id")
    private Utilisateur nettoyeur;


    // Le superviseur qui a validé/refusé
    @ManyToOne
    @JoinColumn(name = "superviseur_id")
    private Utilisateur superviseur;


    private LocalDate date;


    private LocalDateTime heureDebut;


    private LocalDateTime heureFin;


    private Integer duree;


    @Column(columnDefinition = "TEXT")
    private String remarqueNettoyeur;


    @Column(columnDefinition = "TEXT")
    private String remarqueSuperviseur;


    @Enumerated(EnumType.STRING)
    private StatutNettoyage statut;


    private LocalDateTime dateValidation;



    public Nettoyage() {
    }


    public Long getId() {
        return id;
    }


    public Bus getBus() {
        return bus;
    }

    public void setBus(Bus bus) {
        this.bus = bus;
    }


    public TypeNettoyage getTypeNettoyage() {
        return typeNettoyage;
    }

    public void setTypeNettoyage(TypeNettoyage typeNettoyage) {
        this.typeNettoyage = typeNettoyage;
    }


    public Utilisateur getNettoyeur() {
        return nettoyeur;
    }

    public void setNettoyeur(Utilisateur nettoyeur) {
        this.nettoyeur = nettoyeur;
    }


    public Utilisateur getSuperviseur() {
        return superviseur;
    }

    public void setSuperviseur(Utilisateur superviseur) {
        this.superviseur = superviseur;
    }


    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }


    public LocalDateTime getHeureDebut() {
        return heureDebut;
    }

    public void setHeureDebut(LocalDateTime heureDebut) {
        this.heureDebut = heureDebut;
    }


    public LocalDateTime getHeureFin() {
        return heureFin;
    }

    public void setHeureFin(LocalDateTime heureFin) {
        this.heureFin = heureFin;
    }


    public Integer getDuree() {
        return duree;
    }

    public void setDuree(Integer duree) {
        this.duree = duree;
    }


    public String getRemarqueNettoyeur() {
        return remarqueNettoyeur;
    }

    public void setRemarqueNettoyeur(String remarqueNettoyeur) {
        this.remarqueNettoyeur = remarqueNettoyeur;
    }


    public String getRemarqueSuperviseur() {
        return remarqueSuperviseur;
    }

    public void setRemarqueSuperviseur(String remarqueSuperviseur) {
        this.remarqueSuperviseur = remarqueSuperviseur;
    }


    public StatutNettoyage getStatut() {
        return statut;
    }

    public void setStatut(StatutNettoyage statut) {
        this.statut = statut;
    }


    public LocalDateTime getDateValidation() {
        return dateValidation;
    }

    public void setDateValidation(LocalDateTime dateValidation) {
        this.dateValidation = dateValidation;
    }
}