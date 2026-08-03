package com.alsa.alsacleanfleet.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "destinataire_id", nullable = false) private Utilisateur destinataire;
    @ManyToOne @JoinColumn(name = "nettoyage_id") private Nettoyage nettoyage;
    @Column(nullable = false, length = 500) private String message;
    @Column(nullable = false) private boolean lue;
    @Column(name = "date_creation", nullable = false) private LocalDateTime dateCreation;
    public Long getId(){return id;} public Utilisateur getDestinataire(){return destinataire;} public void setDestinataire(Utilisateur v){destinataire=v;}
    public Nettoyage getNettoyage(){return nettoyage;} public void setNettoyage(Nettoyage v){nettoyage=v;}
    public String getMessage(){return message;} public void setMessage(String v){message=v;} public boolean isLue(){return lue;} public void setLue(boolean v){lue=v;}
    public LocalDateTime getDateCreation(){return dateCreation;} public void setDateCreation(LocalDateTime v){dateCreation=v;}
}
