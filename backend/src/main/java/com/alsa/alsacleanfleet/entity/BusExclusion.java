package com.alsa.alsacleanfleet.entity;

import com.alsa.alsacleanfleet.enums.TypeExclusionBus;
import jakarta.persistence.*;

@Entity
@Table(name = "bus_exclusions", uniqueConstraints = @UniqueConstraint(columnNames = "bus_id"))
public class BusExclusion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TypeExclusionBus type;

    public Long getId() { return id; }
    public Bus getBus() { return bus; }
    public void setBus(Bus bus) { this.bus = bus; }
    public TypeExclusionBus getType() { return type; }
    public void setType(TypeExclusionBus type) { this.type = type; }
}
