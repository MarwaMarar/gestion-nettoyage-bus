package com.alsa.alsacleanfleet.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "types_nettoyage")
public class TypeNettoyage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String libelle;

    @Column(columnDefinition = "TEXT")
    private String description;


    public TypeNettoyage() {
    }


    public Long getId() {
        return id;
    }


    public String getLibelle() {
        return libelle;
    }


    public void setLibelle(String libelle) {
        this.libelle = libelle;
    }


    public String getDescription() {
        return description;
    }


    public void setDescription(String description) {
        this.description = description;
    }
}