package com.alsa.alsacleanfleet.repository;

import com.alsa.alsacleanfleet.entity.BusExclusion;
import com.alsa.alsacleanfleet.enums.TypeExclusionBus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BusExclusionRepository extends JpaRepository<BusExclusion, Long> {
    boolean existsByBusId(Long busId);
    List<BusExclusion> findAllByOrderByBusNumeroBusAsc();
    List<BusExclusion> findByTypeOrderByBusNumeroBusAsc(TypeExclusionBus type);
}
