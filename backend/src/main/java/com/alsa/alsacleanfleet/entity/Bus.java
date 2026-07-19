package com.alsa.alsacleanfleet.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "bus")
public class Bus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numeroBus;

    @Column(unique = true)
    private String immatriculation;

    private Boolean actif = true;


    @ManyToOne
    @JoinColumn(name = "type_bus_id")
    private TypeBus typeBus;


    public Bus() {
    }


    public Long getId() {
        return id;
    }


    public String getNumeroBus() {
        return numeroBus;
    }


    public void setNumeroBus(String numeroBus) {
        this.numeroBus = numeroBus;
    }


    public String getImmatriculation() {
        return immatriculation;
    }

    public void setImmatriculation(String immatriculation) {
        this.immatriculation = immatriculation;
    }



    public Boolean getActif() {
        return actif;
    }


    public void setActif(Boolean actif) {
        this.actif = actif;
    }


    public TypeBus getTypeBus() {
        return typeBus;
    }


    public void setTypeBus(TypeBus typeBus) {
        this.typeBus = typeBus;
    }
}