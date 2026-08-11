package com.alsa.alsacleanfleet.service;

import com.alsa.alsacleanfleet.dto.NettoyageRequestDTO;
import com.alsa.alsacleanfleet.entity.Bus;
import com.alsa.alsacleanfleet.entity.Nettoyage;
import com.alsa.alsacleanfleet.entity.TypeNettoyage;
import com.alsa.alsacleanfleet.entity.Utilisateur;
import com.alsa.alsacleanfleet.enums.Role;
import com.alsa.alsacleanfleet.repository.*;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CleaningFrequencyTests {
    private final LocalDate date = LocalDate.of(2026, 8, 10);

    @Test
    void dailyAndSevenTimesPerWeekAreDueTheNextDay() {
        assertEquals(date.plusDays(1), NettoyageService.nextDueDate("Quotidien", date).orElseThrow());
        assertEquals(date.plusDays(1), NettoyageService.nextDueDate("Par jour", date).orElseThrow());
        assertEquals(date.plusDays(1), NettoyageService.nextDueDate("Chaque jour", date).orElseThrow());
    }

    @Test
    void existingPredefinedFrequenciesAreInterpretedWithoutInventingValues() {
        assertEquals(date.plusDays(4), NettoyageService.nextDueDate("2 fois par semaine", date).orElseThrow());
        assertEquals(date.plusMonths(2), NettoyageService.nextDueDate("Chaque 2 mois", date).orElseThrow());
        assertTrue(NettoyageService.nextDueDate("Selon besoin", date).isEmpty());
    }

    @Test
    void dueCleaningReusesExistingAssignmentAndCreatesNoDuplicate() {
        Fixture fixture = new Fixture();
        fixture.stubEligibleDailyBus(false);

        assertEquals(1, fixture.service.generateDueCleanings(date));
        ArgumentCaptor<NettoyageRequestDTO> request = ArgumentCaptor.forClass(NettoyageRequestDTO.class);
        verify(fixture.service).create(request.capture());
        assertEquals(10L, request.getValue().busId());
        assertEquals(20L, request.getValue().typeNettoyageId());
        assertEquals(30L, request.getValue().nettoyeurId());
        assertEquals(40L, request.getValue().superviseurId());

        reset(fixture.service);
        fixture.stubEligibleDailyBus(true);
        assertEquals(0, fixture.service.generateDueCleanings(date));
        verify(fixture.service, never()).create(any());
    }

    @Test
    void dormantOrImmobilizedBusIsNeverPlanned() {
        Fixture fixture = new Fixture();
        fixture.stubEligibleDailyBus(false);
        when(fixture.exclusions.existsByBusId(10L)).thenReturn(true);

        assertEquals(0, fixture.service.generateDueCleanings(date));
        verify(fixture.service, never()).create(any());
    }

    @Test
    void pendingOrRefusedCleaningPreventsASecondAutomaticAssignment() {
        Fixture fixture = new Fixture();
        fixture.stubEligibleDailyBus(false);
        when(fixture.cleanings.existsByBusIdAndTypeNettoyageIdAndStatutIn(
                eq(10L), eq(20L), anyCollection())).thenReturn(true);

        assertEquals(0, fixture.service.generateDueCleanings(date));
        verify(fixture.service, never()).create(any());
    }

    private static class Fixture {
        final NettoyageRepository cleanings = mock(NettoyageRepository.class);
        final BusRepository buses = mock(BusRepository.class);
        final TypeNettoyageRepository types = mock(TypeNettoyageRepository.class);
        final UtilisateurRepository users = mock(UtilisateurRepository.class);
        final NotificationService notifications = mock(NotificationService.class);
        final BusExclusionRepository exclusions = mock(BusExclusionRepository.class);
        final NettoyageService service = spy(new NettoyageService(
                cleanings, buses, types, users, notifications, exclusions));

        void stubEligibleDailyBus(boolean duplicate) {
            Bus bus = mock(Bus.class);
            TypeNettoyage type = mock(TypeNettoyage.class);
            Utilisateur cleaner = mock(Utilisateur.class);
            Utilisateur supervisor = mock(Utilisateur.class);
            Nettoyage history = mock(Nettoyage.class);
            when(bus.getId()).thenReturn(10L);
            when(type.getId()).thenReturn(20L);
            when(type.getFrequence()).thenReturn("Chaque jour");
            when(cleaner.getId()).thenReturn(30L);
            when(cleaner.getActif()).thenReturn(true);
            when(cleaner.getRole()).thenReturn(Role.NETTOYEUR);
            when(supervisor.getId()).thenReturn(40L);
            when(supervisor.getActif()).thenReturn(true);
            when(supervisor.getRole()).thenReturn(Role.SUPERVISEUR);
            when(history.getTypeNettoyage()).thenReturn(type);
            when(history.getDateNettoyage()).thenReturn(LocalDate.of(2026, 8, 9));
            when(history.getNettoyeur()).thenReturn(cleaner);
            when(history.getSuperviseur()).thenReturn(supervisor);
            when(buses.findByActifTrueOrderByNumeroBusAsc()).thenReturn(List.of(bus));
            when(types.findAll()).thenReturn(List.of(type));
            when(cleanings.findByBusIdOrderByDateNettoyageDescIdDesc(10L)).thenReturn(List.of(history));
            when(cleanings.existsByBusIdAndTypeNettoyageIdAndDateNettoyage(10L, 20L,
                    LocalDate.of(2026, 8, 10))).thenReturn(duplicate);
            doReturn(null).when(service).create(any());
        }
    }
}
