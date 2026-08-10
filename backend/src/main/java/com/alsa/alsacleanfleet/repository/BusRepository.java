package com.alsa.alsacleanfleet.repository;

import com.alsa.alsacleanfleet.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface BusRepository extends JpaRepository<Bus, Long> {
 @Lock(LockModeType.PESSIMISTIC_WRITE)
 @Query("select b from Bus b where b.id = :id")
 Optional<Bus> findByIdForUpdate(@Param("id") Long id);
 boolean existsByNumeroBusIgnoreCaseAndIdNot(String numeroBus, Long id);
 java.util.List<Bus> findByActifTrue();
 java.util.List<Bus> findByActifTrueOrderByNumeroBusAsc();
 java.util.List<Bus> findByNumeroBusContainingIgnoreCase(String numeroBus);
}
