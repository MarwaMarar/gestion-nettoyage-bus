package com.alsa.alsacleanfleet.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "types_bus")
public class TypeBus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String libelle;


    public TypeBus() {
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
}