package com.alsa.alsacleanfleet.repository;
import com.alsa.alsacleanfleet.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface NotificationRepository extends JpaRepository<Notification,Long> {
    List<Notification> findByDestinataireIdOrderByDateCreationDesc(Long destinataireId);
    boolean existsByDestinataireIdAndNettoyageIdAndMessageAndLueFalse(
            Long destinataireId, Long nettoyageId, String message);
    long deleteByDestinataireId(Long destinataireId);
}
