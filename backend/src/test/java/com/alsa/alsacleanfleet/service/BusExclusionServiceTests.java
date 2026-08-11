package com.alsa.alsacleanfleet.service;

import com.alsa.alsacleanfleet.entity.Bus;
import com.alsa.alsacleanfleet.entity.BusExclusion;
import com.alsa.alsacleanfleet.repository.BusExclusionRepository;
import com.alsa.alsacleanfleet.repository.BusRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.mockito.Mockito.*;

class BusExclusionServiceTests {
    @Test
    void removingExclusionReactivatesBus() {
        BusExclusionRepository exclusions = mock(BusExclusionRepository.class);
        BusRepository buses = mock(BusRepository.class);
        BusExclusionService service = new BusExclusionService(exclusions, buses);
        BusExclusion exclusion = mock(BusExclusion.class);
        Bus bus = mock(Bus.class);
        when(exclusions.findById(5L)).thenReturn(Optional.of(exclusion));
        when(exclusion.getBus()).thenReturn(bus);

        service.delete(5L);

        verify(exclusions).delete(exclusion);
        verify(bus).setActif(true);
        verify(buses).save(bus);
    }
}
