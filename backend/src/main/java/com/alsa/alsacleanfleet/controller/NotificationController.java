package com.alsa.alsacleanfleet.controller;
import com.alsa.alsacleanfleet.dto.NotificationResponseDTO;
import com.alsa.alsacleanfleet.security.AuthenticatedUser;
import com.alsa.alsacleanfleet.service.NotificationService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
<<<<<<< HEAD
=======
import org.springframework.http.ResponseEntity;
>>>>>>> e35a0c0 (fully works)
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service; public NotificationController(NotificationService service){this.service=service;}
    @GetMapping public List<NotificationResponseDTO> mine(@AuthenticationPrincipal AuthenticatedUser user){return service.mine(user);}
    @PutMapping("/{id}/lire") public NotificationResponseDTO read(@PathVariable Long id,@AuthenticationPrincipal AuthenticatedUser user){return service.read(id,user);}
<<<<<<< HEAD
=======
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id,@AuthenticationPrincipal AuthenticatedUser user){service.delete(id,user);return ResponseEntity.noContent().build();}
>>>>>>> e35a0c0 (fully works)
}
