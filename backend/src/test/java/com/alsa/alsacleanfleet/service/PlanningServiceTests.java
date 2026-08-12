package com.alsa.alsacleanfleet.service;

import com.alsa.alsacleanfleet.enums.Role;
import com.alsa.alsacleanfleet.enums.StatutNettoyage;
import com.alsa.alsacleanfleet.repository.*;
import com.alsa.alsacleanfleet.security.AuthenticatedUser;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PlanningServiceTests {
    @Test
    void adminPlanningUsesAPaginatedSpecificationWithAllFilters() {
        NettoyageRepository cleanings = mock(NettoyageRepository.class);
        NettoyageService service = service(cleanings);
        PageRequest pageable = PageRequest.of(2, 20);
        when(cleanings.findAll(any(Specification.class), eq(pageable))).thenReturn(Page.empty(pageable));

        var result = service.planningPage(admin(), LocalDate.of(2026, 8, 12), 10L, 20L,
                StatutNettoyage.EN_ATTENTE, pageable);

        assertTrue(result.isEmpty());
        assertEquals(2, result.getNumber());
        verify(cleanings).findAll(any(Specification.class), eq(pageable));
    }

    @Test
    void planningEndpointServiceIsRestrictedToAdministrators() {
        NettoyageService service = service(mock(NettoyageRepository.class));
        AuthenticatedUser cleaner = new AuthenticatedUser(2L, "cleaner@test", "", Role.NETTOYEUR, true, false);
        assertThrows(AccessDeniedException.class, () -> service.planningPage(cleaner, LocalDate.now(),
                null, null, null, PageRequest.of(0, 20)));
    }

    @Test
    void planningExportUsesTheSameFilteredSpecificationWithoutPagination() {
        NettoyageRepository cleanings = mock(NettoyageRepository.class);
        NettoyageService service = service(cleanings);
        when(cleanings.findAll(any(Specification.class), any(Sort.class))).thenReturn(List.of());

        var result = service.planningExport(admin(), LocalDate.of(2026, 8, 12), 73L, 4L,
                StatutNettoyage.VALIDE);

        assertTrue(result.isEmpty());
        verify(cleanings).findAll(any(Specification.class), any(Sort.class));
    }

    private NettoyageService service(NettoyageRepository cleanings) {
        return new NettoyageService(cleanings, mock(BusRepository.class), mock(TypeNettoyageRepository.class),
                mock(UtilisateurRepository.class), mock(NotificationService.class), mock(BusExclusionRepository.class));
    }

    private AuthenticatedUser admin() {
        return new AuthenticatedUser(1L, "admin@test", "", Role.ADMINISTRATEUR, true, false);
    }
}
