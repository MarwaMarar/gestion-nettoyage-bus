package com.alsa.alsacleanfleet.service;

import com.alsa.alsacleanfleet.dto.*;
import com.alsa.alsacleanfleet.entity.Bus;
import com.alsa.alsacleanfleet.entity.Nettoyage;
import com.alsa.alsacleanfleet.entity.Utilisateur;
import com.alsa.alsacleanfleet.enums.Role;
import com.alsa.alsacleanfleet.enums.StatutNettoyage;
import com.alsa.alsacleanfleet.exception.BusinessException;
import com.alsa.alsacleanfleet.exception.ResourceNotFoundException;
import com.alsa.alsacleanfleet.exception.WorkflowConflictException;
import com.alsa.alsacleanfleet.repository.BusRepository;
import com.alsa.alsacleanfleet.repository.NettoyageRepository;
import com.alsa.alsacleanfleet.repository.TypeNettoyageRepository;
import com.alsa.alsacleanfleet.repository.UtilisateurRepository;
import com.alsa.alsacleanfleet.security.AuthenticatedUser;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class NettoyageService {
    private final NettoyageRepository repo;
    private final BusRepository busRepo;
    private final TypeNettoyageRepository typeRepo;
    private final UtilisateurRepository userRepo;

    public NettoyageService(
            NettoyageRepository repo,
            BusRepository busRepo,
            TypeNettoyageRepository typeRepo,
            UtilisateurRepository userRepo
    ) {
        this.repo = repo;
        this.busRepo = busRepo;
        this.typeRepo = typeRepo;
        this.userRepo = userRepo;
    }

    @Transactional(readOnly = true)
    public List<NettoyageResponseDTO> findAll() {
        return repo.findAll().stream().map(this::dto).toList();
    }

    @Transactional(readOnly = true)
    public NettoyageResponseDTO findById(Long id) {
        return dto(entity(id));
    }

    @Transactional(readOnly = true)
    public NettoyageResponseDTO findByIdForUser(Long id, AuthenticatedUser principal) {
        Nettoyage nettoyage = entity(id);
        if (principal.role() == Role.NETTOYEUR
                && !nettoyage.getNettoyeur().getId().equals(principal.id())) {
            throw new AccessDeniedException("Ce nettoyage appartient à un autre nettoyeur");
        }
        return dto(nettoyage);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> statistics() {
        return Map.of(
                "total", repo.count(),
                "enAttente", repo.countByStatut(StatutNettoyage.EN_ATTENTE),
                "valides", repo.countByStatut(StatutNettoyage.VALIDE),
                "refuses", repo.countByStatut(StatutNettoyage.REFUSE),
                "aujourdHui", repo.countByDateNettoyage(LocalDate.now())
        );
    }

    public NettoyageResponseDTO create(NettoyageRequestDTO request) {
        Nettoyage nettoyage = new Nettoyage();
        applyAdministrativeRequest(nettoyage, request, true);
        return dto(repo.save(nettoyage));
    }

    public NettoyageResponseDTO update(Long id, NettoyageRequestDTO request) {
        Nettoyage nettoyage = entity(id);
        applyAdministrativeRequest(nettoyage, request, false);
        return dto(repo.save(nettoyage));
    }

    public void delete(Long id) {
        repo.delete(entity(id));
    }

    public NettoyageResponseDTO commencer(
            CommencerNettoyageRequestDTO request,
            AuthenticatedUser principal
    ) {
        Utilisateur nettoyeur = currentUser(principal);
        if (nettoyeur.getRole() != Role.NETTOYEUR
                && nettoyeur.getRole() != Role.ADMINISTRATEUR) {
            throw new AccessDeniedException("Rôle nettoyeur requis");
        }
        if (repo.existsByNettoyeurIdAndStatut(nettoyeur.getId(), StatutNettoyage.EN_COURS)) {
            throw new WorkflowConflictException("Un nettoyage est déjà en cours");
        }

        Bus bus = busRepo.findById(request.busId())
                .orElseThrow(() -> new ResourceNotFoundException("Bus introuvable"));
        if (!Boolean.TRUE.equals(bus.getActif())) {
            throw new WorkflowConflictException("Un bus inactif ne peut pas être nettoyé");
        }

        LocalDateTime now = LocalDateTime.now();
        Nettoyage nettoyage = new Nettoyage();
        nettoyage.setBus(bus);
        nettoyage.setTypeNettoyage(typeRepo.findById(request.typeNettoyageId())
                .orElseThrow(() -> new ResourceNotFoundException("Type de nettoyage introuvable")));
        nettoyage.setNettoyeur(nettoyeur);
        nettoyage.setDateNettoyage(now.toLocalDate());
        nettoyage.setHeureDebut(now);
        nettoyage.setStatut(StatutNettoyage.EN_COURS);
        return dto(repo.save(nettoyage));
    }

    public NettoyageResponseDTO terminer(
            Long id,
            TerminerNettoyageRequestDTO request,
            AuthenticatedUser principal
    ) {
        Nettoyage nettoyage = entity(id);
        if (!nettoyage.getNettoyeur().getId().equals(principal.id())) {
            throw new AccessDeniedException("Ce nettoyage appartient à un autre nettoyeur");
        }
        if (nettoyage.getStatut() != StatutNettoyage.EN_COURS) {
            throw new WorkflowConflictException("Seul un nettoyage en cours peut être terminé");
        }

        LocalDateTime end = LocalDateTime.now();
        nettoyage.setHeureFin(end);
        nettoyage.setDuree((int) Math.max(1, ChronoUnit.MINUTES.between(
                nettoyage.getHeureDebut(),
                end
        )));
        nettoyage.setRemarqueNettoyeur(normalize(request.remarqueNettoyeur()));
        nettoyage.setStatut(StatutNettoyage.EN_ATTENTE);
        return dto(repo.save(nettoyage));
    }

    @Transactional(readOnly = true)
    public List<NettoyageResponseDTO> mesNettoyages(AuthenticatedUser principal) {
        return repo.findByNettoyeurIdOrderByDateNettoyageDescHeureDebutDesc(principal.id())
                .stream()
                .map(this::dto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NettoyageResponseDTO> enAttente() {
        return repo.findByStatutOrderByHeureFinAsc(StatutNettoyage.EN_ATTENTE)
                .stream()
                .map(this::dto)
                .toList();
    }

    public NettoyageResponseDTO valider(
            Long id,
            DecisionNettoyageRequestDTO request,
            AuthenticatedUser principal
    ) {
        return decide(id, request.remarqueSuperviseur(), StatutNettoyage.VALIDE, principal);
    }

    public NettoyageResponseDTO refuser(
            Long id,
            DecisionNettoyageRequestDTO request,
            AuthenticatedUser principal
    ) {
        if (request.remarqueSuperviseur() == null || request.remarqueSuperviseur().isBlank()) {
            throw new BusinessException("La remarque du superviseur est obligatoire pour un refus");
        }
        return decide(id, request.remarqueSuperviseur(), StatutNettoyage.REFUSE, principal);
    }

    private NettoyageResponseDTO decide(
            Long id,
            String remark,
            StatutNettoyage decision,
            AuthenticatedUser principal
    ) {
        Nettoyage nettoyage = entity(id);
        if (nettoyage.getStatut() != StatutNettoyage.EN_ATTENTE) {
            throw new WorkflowConflictException("Ce nettoyage a déjà été traité ou n'est pas en attente");
        }
        Utilisateur superviseur = currentUser(principal);
        if (superviseur.getRole() != Role.SUPERVISEUR
                && superviseur.getRole() != Role.ADMINISTRATEUR) {
            throw new AccessDeniedException("Rôle superviseur requis");
        }
        nettoyage.setSuperviseur(superviseur);
        nettoyage.setRemarqueSuperviseur(normalize(remark));
        nettoyage.setStatut(decision);
        nettoyage.setDateValidation(LocalDateTime.now());
        return dto(repo.save(nettoyage));
    }

    private void applyAdministrativeRequest(
            Nettoyage nettoyage,
            NettoyageRequestDTO request,
            boolean creating
    ) {
        Bus bus = busRepo.findById(request.busId())
                .orElseThrow(() -> new ResourceNotFoundException("Bus introuvable"));
        if (creating && !Boolean.TRUE.equals(bus.getActif())) {
            throw new BusinessException("Un bus inactif ne peut pas recevoir de nettoyage");
        }

        Utilisateur nettoyeur = userRepo.findById(request.nettoyeurId())
                .orElseThrow(() -> new ResourceNotFoundException("Nettoyeur introuvable"));
        requireRole(nettoyeur, Role.NETTOYEUR);
        if (creating && !Boolean.TRUE.equals(nettoyeur.getActif())) {
            throw new BusinessException("Un utilisateur inactif ne peut pas être assigné");
        }

        Utilisateur superviseur = request.superviseurId() == null
                ? null
                : userRepo.findById(request.superviseurId())
                .orElseThrow(() -> new ResourceNotFoundException("Superviseur introuvable"));
        if (superviseur != null
                && superviseur.getRole() != Role.SUPERVISEUR
                && superviseur.getRole() != Role.ADMINISTRATEUR) {
            throw new BusinessException("Rôle superviseur invalide");
        }
        if (request.heureDebut() != null
                && request.heureFin() != null
                && request.heureFin().isBefore(request.heureDebut())) {
            throw new BusinessException("heureFin ne peut pas précéder heureDebut");
        }

        boolean decided = request.statut() == StatutNettoyage.VALIDE
                || request.statut() == StatutNettoyage.REFUSE;
        if (!decided && (request.dateValidation() != null || superviseur != null)) {
            throw new BusinessException("Un nettoyage non traité ne doit pas avoir de validation");
        }
        if (decided && (superviseur == null || request.dateValidation() == null)) {
            throw new BusinessException("Superviseur et dateValidation sont obligatoires");
        }

        nettoyage.setBus(bus);
        nettoyage.setTypeNettoyage(typeRepo.findById(request.typeNettoyageId())
                .orElseThrow(() -> new ResourceNotFoundException("Type de nettoyage introuvable")));
        nettoyage.setNettoyeur(nettoyeur);
        nettoyage.setSuperviseur(superviseur);
        nettoyage.setDateNettoyage(request.dateNettoyage());
        nettoyage.setHeureDebut(request.heureDebut());
        nettoyage.setHeureFin(request.heureFin());
        Integer duration = request.duree();
        if (duration == null && request.heureDebut() != null && request.heureFin() != null) {
            duration = (int) ChronoUnit.MINUTES.between(request.heureDebut(), request.heureFin());
        }
        nettoyage.setDuree(duration);
        nettoyage.setRemarqueNettoyeur(normalize(request.remarqueNettoyeur()));
        nettoyage.setRemarqueSuperviseur(normalize(request.remarqueSuperviseur()));
        nettoyage.setStatut(request.statut());
        nettoyage.setDateValidation(request.dateValidation());
    }

    private Utilisateur currentUser(AuthenticatedUser principal) {
        return userRepo.findById(principal.id())
                .filter(user -> Boolean.TRUE.equals(user.getActif()))
                .orElseThrow(() -> new AccessDeniedException("Utilisateur inactif ou introuvable"));
    }

    private void requireRole(Utilisateur user, Role role) {
        if (user.getRole() != role) {
            throw new BusinessException("Le rôle " + role + " est requis");
        }
    }

    private Nettoyage entity(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nettoyage introuvable"));
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private NettoyageResponseDTO dto(Nettoyage nettoyage) {
        Utilisateur superviseur = nettoyage.getSuperviseur();
        return new NettoyageResponseDTO(
                nettoyage.getId(),
                nettoyage.getBus().getId(),
                nettoyage.getBus().getNumeroBus(),
                nettoyage.getTypeNettoyage().getId(),
                nettoyage.getTypeNettoyage().getLibelle(),
                nettoyage.getNettoyeur().getId(),
                nettoyage.getNettoyeur().getPrenom() + " " + nettoyage.getNettoyeur().getNom(),
                superviseur == null ? null : superviseur.getId(),
                superviseur == null ? null : superviseur.getPrenom() + " " + superviseur.getNom(),
                nettoyage.getDateNettoyage(),
                nettoyage.getHeureDebut(),
                nettoyage.getHeureFin(),
                nettoyage.getDuree(),
                nettoyage.getRemarqueNettoyeur(),
                nettoyage.getRemarqueSuperviseur(),
                nettoyage.getStatut(),
                nettoyage.getDateValidation()
        );
    }
}
