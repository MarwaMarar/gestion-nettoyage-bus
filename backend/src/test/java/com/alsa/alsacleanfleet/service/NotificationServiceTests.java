package com.alsa.alsacleanfleet.service;

import com.alsa.alsacleanfleet.entity.Nettoyage;
import com.alsa.alsacleanfleet.entity.Notification;
import com.alsa.alsacleanfleet.entity.Utilisateur;
import com.alsa.alsacleanfleet.repository.NotificationRepository;
import com.alsa.alsacleanfleet.security.AuthenticatedUser;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.mockito.Mockito.*;

class NotificationServiceTests {
    @Test
    void duplicateUnreadNotificationIsNotCreated() {
        NotificationRepository repository = mock(NotificationRepository.class);
        NotificationService service = new NotificationService(repository);
        Utilisateur recipient = mock(Utilisateur.class);
        Nettoyage cleaning = mock(Nettoyage.class);
        when(recipient.getId()).thenReturn(1L);
        when(cleaning.getId()).thenReturn(2L);
        when(repository.existsByDestinataireIdAndNettoyageIdAndMessageAndLueFalse(
                1L, 2L, "Même message")).thenReturn(true);

        service.create(recipient, cleaning, "Même message");

        verify(repository, never()).save(any());
    }

    @Test
    void bulkActionsOnlyTargetAuthenticatedRecipient() {
        NotificationRepository repository = mock(NotificationRepository.class);
        NotificationService service = new NotificationService(repository);
        AuthenticatedUser user = mock(AuthenticatedUser.class);
        Notification notification = mock(Notification.class);
        when(user.id()).thenReturn(7L);
        when(repository.findByDestinataireIdOrderByDateCreationDesc(7L))
                .thenReturn(List.of(notification));

        service.readAll(user);
        service.deleteAll(user);

        verify(notification).setLue(true);
        verify(repository).deleteByDestinataireId(7L);
    }
}
