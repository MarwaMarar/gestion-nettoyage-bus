package com.alsa.alsacleanfleet;

import com.alsa.alsacleanfleet.dto.TerminerNettoyageRequestDTO;
import com.alsa.alsacleanfleet.entity.Nettoyage;
import com.alsa.alsacleanfleet.entity.Notification;
import com.alsa.alsacleanfleet.entity.Utilisateur;
import com.alsa.alsacleanfleet.enums.Role;
import com.alsa.alsacleanfleet.enums.StatutNettoyage;
import com.alsa.alsacleanfleet.repository.NettoyageRepository;
import com.alsa.alsacleanfleet.repository.NotificationRepository;
import com.alsa.alsacleanfleet.repository.UtilisateurRepository;
import com.alsa.alsacleanfleet.security.AuthenticatedUser;
import com.alsa.alsacleanfleet.security.JwtService;
import com.alsa.alsacleanfleet.service.NettoyageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class NotificationAndCleanerWorkflowTests {
    @Autowired MockMvc mvc;
    @Autowired UtilisateurRepository users;
    @Autowired NotificationRepository notifications;
    @Autowired NettoyageRepository cleanings;
    @Autowired NettoyageService cleaningService;
    @Autowired JwtService jwtService;

    @Test
    void everyRoleCanDeleteOnlyItsOwnNotification() throws Exception {
        for (Role role : Role.values()) {
            Utilisateur owner = activeUser(role);
            Notification notification = notification(owner, "Notification " + role);

            mvc.perform(delete("/api/notifications/{id}", notification.getId())
                            .header("Authorization", bearer(owner)))
                    .andExpect(status().isNoContent());

            assertFalse(notifications.existsById(notification.getId()));
        }

        Utilisateur owner = activeUser(Role.NETTOYEUR);
        Utilisateur other = activeUser(Role.SUPERVISEUR);
        Notification notification = notification(owner, "Notification privée");

        mvc.perform(delete("/api/notifications/{id}", notification.getId())
                        .header("Authorization", bearer(other)))
                .andExpect(status().isForbidden());

        assertTrue(notifications.existsById(notification.getId()));
    }

    @Test
    void onlyAssignedCleanerCanFinishAndBackendComputesCompletion() {
        Nettoyage cleaning = cleanings.findAll().stream()
                .filter(value -> value.getNettoyeur() != null && value.getSuperviseur() != null)
                .findFirst().orElseThrow();
        Utilisateur assigned = cleaning.getNettoyeur();
        Utilisateur other = users.findByRoleAndActifTrue(Role.NETTOYEUR).stream()
                .filter(value -> !value.getId().equals(assigned.getId())).findFirst().orElseThrow();

        cleaning.setStatut(StatutNettoyage.EN_ATTENTE);
        cleaning.setHeureDebut(LocalDateTime.now().minusMinutes(7));
        cleaning.setHeureFin(null);
        cleaning.setDuree(null);
        cleanings.saveAndFlush(cleaning);

        assertThrows(AccessDeniedException.class, () -> cleaningService.terminer(
                cleaning.getId(), new TerminerNettoyageRequestDTO(null), AuthenticatedUser.from(other)));

        var result = cleaningService.terminer(
                cleaning.getId(), new TerminerNettoyageRequestDTO(null), AuthenticatedUser.from(assigned));

        assertNotNull(result.heureFin());
        assertNotNull(result.duree());
        assertTrue(result.duree() >= 1);
        assertEquals(StatutNettoyage.EN_ATTENTE, result.statut());
        assertTrue(notifications.findByDestinataireIdOrderByDateCreationDesc(cleaning.getSuperviseur().getId())
                .stream().anyMatch(value -> cleaning.getId().equals(
                        value.getNettoyage() == null ? null : value.getNettoyage().getId())));
    }

    private Utilisateur activeUser(Role role) {
        Utilisateur user = users.findByRoleAndActifTrue(role).stream().findFirst().orElseThrow();
        user.setDoitChangerMotDePasse(false);
        return users.saveAndFlush(user);
    }

    private Notification notification(Utilisateur owner, String message) {
        Notification value = new Notification();
        value.setDestinataire(owner);
        value.setMessage(message);
        value.setDateCreation(LocalDateTime.now());
        return notifications.saveAndFlush(value);
    }

    private String bearer(Utilisateur user) {
        return "Bearer " + jwtService.generate(AuthenticatedUser.from(user));
    }
}
