package com.alsa.alsacleanfleet.controller;
import com.alsa.alsacleanfleet.dto.NotificationResponseDTO;
import com.alsa.alsacleanfleet.security.AuthenticatedUser;
import com.alsa.alsacleanfleet.service.NotificationService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service; public NotificationController(NotificationService service){this.service=service;}
    @GetMapping public List<NotificationResponseDTO> mine(@AuthenticationPrincipal AuthenticatedUser user){return service.mine(user);}
    @PutMapping("/{id}/lire") public NotificationResponseDTO read(@PathVariable Long id,@AuthenticationPrincipal AuthenticatedUser user){return service.read(id,user);}
    @PutMapping("/tout-lire") public ResponseEntity<Void> readAll(@AuthenticationPrincipal AuthenticatedUser user){service.readAll(user);return ResponseEntity.noContent().build();}
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id,@AuthenticationPrincipal AuthenticatedUser user){service.delete(id,user);return ResponseEntity.noContent().build();}
    @DeleteMapping("/toutes") public ResponseEntity<Void> deleteAll(@AuthenticationPrincipal AuthenticatedUser user){service.deleteAll(user);return ResponseEntity.noContent().build();}
}
