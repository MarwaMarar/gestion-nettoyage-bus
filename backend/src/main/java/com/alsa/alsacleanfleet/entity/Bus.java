package com.alsa.alsacleanfleet.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "bus")
public class Bus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_bus", nullable = false, unique = true, length = 50)
    private String numeroBus;

    private Boolean actif = true;


    @ManyToOne(optional = false)
    @JoinColumn(name = "type_bus_id", nullable = false)
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
