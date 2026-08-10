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
import com.alsa.alsacleanfleet.repository.BusExclusionRepository;
import com.alsa.alsacleanfleet.repository.NettoyageRepository;
import com.alsa.alsacleanfleet.repository.TypeNettoyageRepository;
import com.alsa.alsacleanfleet.repository.UtilisateurRepository;
import com.alsa.alsacleanfleet.security.AuthenticatedUser;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.text.Normalizer;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Transactional
public class NettoyageService {
    private final NettoyageRepository repo;
    private final BusRepository busRepo;
    private final TypeNettoyageRepository typeRepo;
    private final UtilisateurRepository userRepo;
    private final BusExclusionRepository busExclusionRepo;
    private final NotificationService notifications;

    public NettoyageService(
            NettoyageRepository repo,
            BusRepository busRepo,
            TypeNettoyageRepository typeRepo,
            UtilisateurRepository userRepo,
            NotificationService notifications,
            BusExclusionRepository busExclusionRepo
    ) {
        this.repo = repo;
        this.busRepo = busRepo;
        this.typeRepo = typeRepo;
        this.userRepo = userRepo;
        this.notifications = notifications;
        this.busExclusionRepo = busExclusionRepo;
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
        if (principal.role() == Role.SUPERVISEUR
                && nettoyage.getSuperviseur() != null
                && !nettoyage.getSuperviseur().getId().equals(principal.id())) {
            throw new AccessDeniedException("Ce nettoyage est assigné à un autre superviseur");
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
        nettoyage = repo.save(nettoyage);
        notifications.create(nettoyage.getNettoyeur(), nettoyage,
                "Nouveau nettoyage assigné : bus " + nettoyage.getBus().getNumeroBus());
        notifications.create(nettoyage.getSuperviseur(), nettoyage,
                "Nouveau nettoyage assigné au nettoyeur " + nettoyage.getNettoyeur().getPrenom());
        return dto(nettoyage);
    }

    public NettoyageResponseDTO update(Long id, NettoyageRequestDTO request) {
        Nettoyage nettoyage = entity(id);
        applyAdministrativeRequest(nettoyage, request, false);
        resetForCleaner(nettoyage, null);
        nettoyage = repo.save(nettoyage);
        notifications.create(nettoyage.getNettoyeur(), nettoyage,
                "Nettoyage modifie par l'administrateur et remis a disposition : bus "
                        + nettoyage.getBus().getNumeroBus());
        return dto(nettoyage);
    }

    public void delete(Long id) {
        repo.delete(entity(id));
    }

    public NettoyageResponseDTO commencer(
            CommencerNettoyageRequestDTO request,
            AuthenticatedUser principal
    ) {
        Utilisateur nettoyeur = currentUser(principal);
        if (nettoyeur.getRole() != Role.NETTOYEUR) {
            throw new AccessDeniedException("Rôle nettoyeur requis");
        }
        if (repo.existsByNettoyeurIdAndStatutAndHeureDebutIsNotNullAndHeureFinIsNull(
                nettoyeur.getId(), StatutNettoyage.EN_ATTENTE)) {
            throw new WorkflowConflictException("Un nettoyage est déjà en cours");
        }

        Nettoyage nettoyage = entity(request.nettoyageId());
        if (!nettoyage.getNettoyeur().getId().equals(nettoyeur.getId())) {
            throw new AccessDeniedException("Ce nettoyage est assigné à un autre nettoyeur");
        }
        boolean legacyRefusal = nettoyage.getStatut() == StatutNettoyage.REFUSE;
        boolean availableAssignment = nettoyage.getStatut() == StatutNettoyage.EN_ATTENTE
                && nettoyage.getHeureDebut() == null
                && nettoyage.getHeureFin() == null;
        if (!legacyRefusal && !availableAssignment) {
            throw new WorkflowConflictException("Seul un nettoyage assigné peut être commencé");
        }
        if (!Boolean.TRUE.equals(nettoyage.getBus().getActif())) {
            throw new WorkflowConflictException("Un bus inactif ne peut pas être nettoyé");
        }

        if (busExclusionRepo.existsByBusId(nettoyage.getBus().getId())) {
            throw new WorkflowConflictException("Un bus dormant ou immobilise ne peut pas etre nettoye");
        }

        LocalDateTime now = LocalDateTime.now();
        nettoyage.setDateNettoyage(now.toLocalDate());
        nettoyage.setHeureDebut(now);
        nettoyage.setHeureFin(null);
        nettoyage.setDuree(null);
        nettoyage.setRemarqueNettoyeur(null);
        nettoyage.setDateValidation(null);
        nettoyage.setStatut(StatutNettoyage.EN_ATTENTE);
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
        if (nettoyage.getStatut() != StatutNettoyage.EN_ATTENTE
                || nettoyage.getHeureDebut() == null
                || nettoyage.getHeureFin() != null) {
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
        nettoyage = repo.save(nettoyage);
        notifications.create(nettoyage.getSuperviseur(), nettoyage,
                "Nettoyage terminé et prêt à valider : bus " + nettoyage.getBus().getNumeroBus());
        return dto(nettoyage);
    }

    @Transactional(readOnly = true)
    public List<NettoyageResponseDTO> mesNettoyages(AuthenticatedUser principal) {
        return repo.findByNettoyeurIdOrderByDateNettoyageDescHeureDebutDesc(principal.id())
                .stream()
                .map(this::dto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NettoyageResponseDTO> enAttente(AuthenticatedUser principal) {
        List<Nettoyage> values = principal.role() == Role.ADMINISTRATEUR
                ? repo.findByStatutAndHeureFinIsNotNullOrderByHeureFinAsc(StatutNettoyage.EN_ATTENTE)
                : repo.findPendingVisibleToSupervisor(StatutNettoyage.EN_ATTENTE, principal.id());
        return values
                .stream()
                .map(this::dto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<NettoyageResponseDTO> adminCleanerPage(
            AuthenticatedUser principal, Long nettoyeurId, LocalDate dateDebut, LocalDate dateFin,
            Long busId, Pageable pageable
    ) {
        requireReadViewerAndTargetRole(principal, nettoyeurId, Role.NETTOYEUR);
        return repo.findAll(adminViewSpecification("nettoyeur", nettoyeurId, dateDebut, dateFin, busId), pageable)
                .map(this::dto);
    }

    @Transactional(readOnly = true)
    public Page<NettoyageResponseDTO> adminSupervisorPage(
            AuthenticatedUser principal, Long superviseurId, LocalDate dateDebut, LocalDate dateFin,
            Long busId, Pageable pageable
    ) {
        requireReadViewerAndTargetRole(principal, superviseurId, Role.SUPERVISEUR);
        return repo.findAll(adminViewSpecification("superviseur", superviseurId, dateDebut, dateFin, busId), pageable)
                .map(this::dto);
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
        if (nettoyage.getStatut() != StatutNettoyage.EN_ATTENTE
                || nettoyage.getHeureFin() == null) {
            throw new WorkflowConflictException("Ce nettoyage a déjà été traité ou n'est pas en attente");
        }
        Utilisateur superviseur = currentUser(principal);
        if (superviseur.getRole() != Role.SUPERVISEUR
                && superviseur.getRole() != Role.ADMINISTRATEUR) {
            throw new AccessDeniedException("Rôle superviseur requis");
        }
        if (superviseur.getRole() == Role.SUPERVISEUR
                && nettoyage.getSuperviseur() != null
                && !nettoyage.getSuperviseur().getId().equals(superviseur.getId())) {
            throw new AccessDeniedException("Ce nettoyage est assigné à un autre superviseur");
        }
        nettoyage.setSuperviseur(superviseur);
        if (decision == StatutNettoyage.REFUSE) {
            resetForCleaner(nettoyage, remark);
        } else {
            nettoyage.setRemarqueSuperviseur(normalize(remark));
            nettoyage.setStatut(decision);
            nettoyage.setDateValidation(LocalDateTime.now());
        }
        nettoyage = repo.save(nettoyage);
        String result = decision == StatutNettoyage.VALIDE ? "validé" : "refusé";
        notifications.create(nettoyage.getNettoyeur(), nettoyage,
                "Votre nettoyage du bus " + nettoyage.getBus().getNumeroBus() + " a été " + result);
        for (Utilisateur admin : userRepo.findByRoleAndActifTrue(Role.ADMINISTRATEUR)) {
            notifications.create(admin, nettoyage,
                    "Nettoyage " + result + " : bus " + nettoyage.getBus().getNumeroBus());
        }
        return dto(nettoyage);
    }

    @Scheduled(cron = "${app.cleaning-planning.cron:0 */5 * * * *}", zone = "Africa/Casablanca")
    public synchronized void generateDailyPlanning() {
        generateDueCleanings(LocalDate.now());
    }

    public int generateDueCleanings(LocalDate planningDate) {
        int created = 0;
        var cleaningTypes = typeRepo.findAll();
        for (Bus bus : busRepo.findByActifTrueOrderByNumeroBusAsc()) {
            if (busExclusionRepo.existsByBusId(bus.getId())) continue;
            List<Nettoyage> busHistory = repo.findByBusIdOrderByDateNettoyageDescIdDesc(bus.getId());
            for (var type : cleaningTypes) {
                List<Nettoyage> sameTypeHistory = busHistory.stream()
                        .filter(value -> value.getTypeNettoyage().getId().equals(type.getId()))
                        .toList();
                LocalDate lastDate = sameTypeHistory.isEmpty()
                        ? null
                        : sameTypeHistory.getFirst().getDateNettoyage();
                if (!isDue(type.getFrequence(), lastDate, planningDate)
                        || repo.existsByBusIdAndTypeNettoyageIdAndDateNettoyage(
                                bus.getId(), type.getId(), planningDate)) {
                    continue;
                }

                Nettoyage assignment = sameTypeHistory.stream()
                        .filter(this::hasReusableAssignment)
                        .findFirst()
                        .orElseGet(() -> busHistory.stream()
                                .filter(this::hasReusableAssignment)
                                .findFirst()
                                .orElse(null));
                if (assignment == null) continue;

                create(new NettoyageRequestDTO(
                        bus.getId(), type.getId(), assignment.getNettoyeur().getId(),
                        assignment.getSuperviseur().getId(), planningDate,
                        null, null, null, null, null,
                        StatutNettoyage.EN_ATTENTE, null));
                created++;
            }
        }
        return created;
    }

    private void resetForCleaner(Nettoyage nettoyage, String refusalReason) {
        nettoyage.setStatut(StatutNettoyage.EN_ATTENTE);
        nettoyage.setHeureDebut(null);
        nettoyage.setHeureFin(null);
        nettoyage.setDuree(null);
        nettoyage.setRemarqueNettoyeur(null);
        nettoyage.setRemarqueSuperviseur(normalize(refusalReason));
        nettoyage.setDateValidation(null);
    }

    private void applyAdministrativeRequest(
            Nettoyage nettoyage,
            NettoyageRequestDTO request,
            boolean creating
    ) {
        Bus bus = busRepo.findByIdForUpdate(request.busId())
                .orElseThrow(() -> new ResourceNotFoundException("Bus introuvable"));
        if (creating && !Boolean.TRUE.equals(bus.getActif())) {
            throw new BusinessException("Un bus inactif ne peut pas recevoir de nettoyage");
        }
        if (busExclusionRepo.existsByBusId(bus.getId())) {
            throw new BusinessException("Un bus dormant ou immobilise ne peut pas recevoir de nettoyage");
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
        boolean decided = request.statut() == StatutNettoyage.VALIDE
                || request.statut() == StatutNettoyage.REFUSE;
        boolean administrativeAssignment = request.statut() == StatutNettoyage.EN_ATTENTE
                && request.heureDebut() == null
                && request.heureFin() == null;
        if (administrativeAssignment && superviseur == null) {
            throw new BusinessException("Un superviseur est obligatoire pour une assignation");
        }
        if (superviseur != null) {
            boolean validDecisionActor = decided && superviseur.getRole() == Role.ADMINISTRATEUR;
            if (superviseur.getRole() != Role.SUPERVISEUR && !validDecisionActor) {
                throw new BusinessException("Le rôle SUPERVISEUR est requis pour une assignation");
            }
            if (creating && !Boolean.TRUE.equals(superviseur.getActif())) {
                throw new BusinessException("Un superviseur inactif ne peut pas être assigné");
            }
        }
        if (request.heureDebut() != null
                && request.heureFin() != null
                && request.heureFin().isBefore(request.heureDebut())) {
            throw new BusinessException("heureFin ne peut pas précéder heureDebut");
        }

        if (!decided && request.dateValidation() != null) {
            throw new BusinessException("Un nettoyage non traité ne doit pas avoir de date de validation");
        }
        if (decided && (superviseur == null || request.dateValidation() == null)) {
            throw new BusinessException("Superviseur et dateValidation sont obligatoires");
        }

        var typeNettoyage = typeRepo.findById(request.typeNettoyageId())
                .orElseThrow(() -> new ResourceNotFoundException("Type de nettoyage introuvable"));
        boolean duplicate = nettoyage.getId() == null
                ? repo.existsByBusIdAndTypeNettoyageIdAndDateNettoyage(
                        bus.getId(), typeNettoyage.getId(), request.dateNettoyage())
                : repo.existsByBusIdAndTypeNettoyageIdAndDateNettoyageAndIdNot(
                        bus.getId(), typeNettoyage.getId(), request.dateNettoyage(), nettoyage.getId());
        if (duplicate) {
            throw new BusinessException("Un nettoyage existe deja pour ce bus, ce type et cette date");
        }
        validateFrequency(nettoyage.getId(), bus.getId(), typeNettoyage.getId(),
                request.dateNettoyage(), typeNettoyage.getFrequence());
        nettoyage.setBus(bus);
        nettoyage.setTypeNettoyage(typeNettoyage);
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

    private void validateFrequency(Long currentId, Long busId, Long typeId, LocalDate date, String frequency) {
        for (Nettoyage existing : repo.findByBusIdAndTypeNettoyageIdOrderByDateNettoyageAsc(busId, typeId)) {
            if (existing.getId().equals(currentId)) continue;
            LocalDate existingDate = existing.getDateNettoyage();
            Optional<LocalDate> earliestAfterExisting = nextDueDate(frequency, existingDate);
            Optional<LocalDate> earliestAfterCandidate = nextDueDate(frequency, date);
            if (earliestAfterExisting.isEmpty() || earliestAfterCandidate.isEmpty()) return;
            boolean conflict = !date.isBefore(existingDate)
                    ? date.isBefore(earliestAfterExisting.get())
                    : existingDate.isBefore(earliestAfterCandidate.get());
            if (conflict) {
                throw new BusinessException("La date ne respecte pas la frequence '" + frequency
                        + "' pour ce bus et ce type de nettoyage");
            }
        }
    }

    static Optional<LocalDate> nextDueDate(String frequency, LocalDate fromDate) {
        if (frequency == null || frequency.isBlank() || fromDate == null) return Optional.empty();
        String normalized = Normalizer.normalize(frequency, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toLowerCase().trim();
        Matcher weekly = Pattern.compile("(\\d+)\\s+fois\\s+par\\s+semaine").matcher(normalized);
        Matcher monthly = Pattern.compile("(?:chaque|tous les)\\s+(\\d+)\\s+mois").matcher(normalized);
        if (weekly.find()) {
            int occurrences = Integer.parseInt(weekly.group(1));
            return occurrences <= 0
                    ? Optional.empty()
                    : Optional.of(fromDate.plusDays((long) Math.ceil(7d / occurrences)));
        }
        if (monthly.find()) return Optional.of(fromDate.plusMonths(Integer.parseInt(monthly.group(1))));
        if (normalized.contains("quotidien") || normalized.contains("chaque jour")) {
            return Optional.of(fromDate.plusDays(1));
        }
        return Optional.empty();
    }

    private boolean isDue(String frequency, LocalDate lastDate, LocalDate planningDate) {
        if (lastDate == null) return nextDueDate(frequency, planningDate).isPresent();
        Optional<LocalDate> nextDate = nextDueDate(frequency, lastDate);
        return nextDate.isPresent() && !planningDate.isBefore(nextDate.get());
    }

    private boolean hasReusableAssignment(Nettoyage value) {
        return value.getNettoyeur() != null
                && Boolean.TRUE.equals(value.getNettoyeur().getActif())
                && value.getNettoyeur().getRole() == Role.NETTOYEUR
                && value.getSuperviseur() != null
                && Boolean.TRUE.equals(value.getSuperviseur().getActif())
                && value.getSuperviseur().getRole() == Role.SUPERVISEUR;
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

    private void requireReadViewerAndTargetRole(AuthenticatedUser principal, Long userId, Role role) {
        if (principal.role() != Role.ADMINISTRATEUR && principal.role() != Role.CONSULTANT) {
            throw new AccessDeniedException("Rôle de consultation requis");
        }
        Utilisateur target = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        requireRole(target, role);
    }

    private Specification<Nettoyage> adminViewSpecification(
            String relation, Long userId, LocalDate dateDebut, LocalDate dateFin, Long busId
    ) {
        if (dateDebut != null && dateFin != null && dateDebut.isAfter(dateFin)) {
            throw new BusinessException("La date de début doit précéder la date de fin");
        }
        return (root, query, builder) -> {
            var predicate = builder.equal(root.get(relation).get("id"), userId);
            if (dateDebut != null) predicate = builder.and(predicate,
                    builder.greaterThanOrEqualTo(root.get("dateNettoyage"), dateDebut));
            if (dateFin != null) predicate = builder.and(predicate,
                    builder.lessThanOrEqualTo(root.get("dateNettoyage"), dateFin));
            if (busId != null) predicate = builder.and(predicate,
                    builder.equal(root.get("bus").get("id"), busId));
            return predicate;
        };
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
