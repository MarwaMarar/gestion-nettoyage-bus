package com.alsa.alsacleanfleet.repository;

import com.alsa.alsacleanfleet.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusRepository extends JpaRepository<Bus, Long> {
 boolean existsByNumeroBusIgnoreCaseAndIdNot(String numeroBus, Long id);
 java.util.List<Bus> findByActifTrue();
 java.util.List<Bus> findByNumeroBusContainingIgnoreCase(String numeroBus);
}
