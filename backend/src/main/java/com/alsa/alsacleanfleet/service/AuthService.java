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
import org.springframework.security.crypto.password.PasswordEncoder;
import com.alsa.alsacleanfleet.exception.BusinessException;

@Service
public class AuthService {
    private final UtilisateurRepository utilisateurs;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UtilisateurRepository utilisateurs,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            PasswordEncoder passwordEncoder
    ) {
        this.utilisateurs = utilisateurs;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
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
                    dto(utilisateur),
                    Boolean.TRUE.equals(utilisateur.getDoitChangerMotDePasse())
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

    @Transactional
    public LoginResponseDTO changePassword(ChangePasswordRequestDTO request, AuthenticatedUser principal) {
        Utilisateur utilisateur = utilisateurs.findById(principal.id())
                .filter(user -> Boolean.TRUE.equals(user.getActif()))
                .orElseThrow(() -> new UnauthorizedException("Utilisateur inactif ou introuvable"));
        if (!Boolean.TRUE.equals(utilisateur.getDoitChangerMotDePasse())) {
            throw new org.springframework.security.access.AccessDeniedException("Changement de mot de passe non requis");
        }
        String password = request.newPassword();
        if (!password.equals(request.confirmPassword())) {
            throw new BusinessException("Les mots de passe ne correspondent pas");
        }
        if (!password.matches(".*[A-Z].*")) throw new BusinessException("Le mot de passe doit contenir une lettre majuscule");
        if (!password.matches(".*[0-9].*")) throw new BusinessException("Le mot de passe doit contenir un chiffre");
        if (!password.matches(".*[^A-Za-z0-9\\s].*")) throw new BusinessException("Le mot de passe doit contenir un symbole spécial");
        if (passwordEncoder.matches(password, utilisateur.getMotDePasse())) {
            throw new BusinessException("Le nouveau mot de passe doit être différent du mot de passe provisoire");
        }
        utilisateur.setMotDePasse(passwordEncoder.encode(password));
        utilisateur.setDoitChangerMotDePasse(false);
        utilisateur = utilisateurs.save(utilisateur);
        AuthenticatedUser updated = AuthenticatedUser.from(utilisateur);
        return new LoginResponseDTO(jwtService.generate(updated), "Bearer", jwtService.expirationSeconds(),
                dto(utilisateur), false);
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
                utilisateur.getActif(),
                utilisateur.getDoitChangerMotDePasse()
        );
    }
}
