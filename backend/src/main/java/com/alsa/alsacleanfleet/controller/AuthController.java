package com.alsa.alsacleanfleet.controller;

import com.alsa.alsacleanfleet.dto.LoginRequestDTO;
import com.alsa.alsacleanfleet.dto.LoginResponseDTO;
import com.alsa.alsacleanfleet.dto.AuthenticatedUserDTO;
import com.alsa.alsacleanfleet.security.AuthenticatedUser;
import com.alsa.alsacleanfleet.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponseDTO login(@Valid @RequestBody LoginRequestDTO request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public AuthenticatedUserDTO me(@AuthenticationPrincipal AuthenticatedUser principal) {
        return authService.me(principal);
    }
}
