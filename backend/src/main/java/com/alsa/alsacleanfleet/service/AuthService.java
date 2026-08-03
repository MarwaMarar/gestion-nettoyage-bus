package com.alsa.alsacleanfleet.service;

import com.alsa.alsacleanfleet.dto.*;
import com.alsa.alsacleanfleet.entity.Utilisateur;
import com.alsa.alsacleanfleet.exception.UnauthorizedException;
import com.alsa.alsacleanfleet.repository.UtilisateurRepository;
import com.alsa.alsacleanfleet.security.AuthenticatedUser;
import com.alsa.alsacleanfleet.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UtilisateurRepository utilisateurs;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UtilisateurRepository utilisateurs,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.utilisateurs = utilisateurs;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponseDTO login(LoginRequestDTO request) {
        String login = request.login().trim();
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(login, request.motDePasse())
            );
            AuthenticatedUser principal = (AuthenticatedUser) authentication.getPrincipal();
            Utilisateur utilisateur = utilisateurs.findById(principal.id())
                    .orElseThrow(() -> new UnauthorizedException("Utilisateur introuvable"));
            return new LoginResponseDTO(
                    jwtService.generate(principal),
                    "Bearer",
                    jwtService.expirationSeconds(),
                    dto(utilisateur)
            );
        } catch (org.springframework.security.core.AuthenticationException exception) {
            throw new UnauthorizedException("Login ou mot de passe incorrect");
        }
    }

    @Transactional(readOnly = true)
    public AuthenticatedUserDTO me(AuthenticatedUser principal) {
        return utilisateurs.findById(principal.id())
                .filter(user -> Boolean.TRUE.equals(user.getActif()))
                .map(this::dto)
                .orElseThrow(() -> new UnauthorizedException("Utilisateur inactif ou introuvable"));
    }

    private AuthenticatedUserDTO dto(Utilisateur utilisateur) {
        return new AuthenticatedUserDTO(
                utilisateur.getId(),
                utilisateur.getNom(),
                utilisateur.getPrenom(),
                utilisateur.getMatricule(),
                utilisateur.getEmail(),
                utilisateur.getLogin(),
                utilisateur.getRole(),
                utilisateur.getActif()
        );
    }
}
