package com.alsa.alsacleanfleet.security;

import com.alsa.alsacleanfleet.entity.Utilisateur;
import com.alsa.alsacleanfleet.enums.Role;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public record AuthenticatedUser(
        Long id,
        String email,
        String password,
        Role role,
        boolean active,
        boolean mustChangePassword
) implements UserDetails {
    public static AuthenticatedUser from(Utilisateur user) {
        return new AuthenticatedUser(
                user.getId(),
                user.getEmail(),
                user.getMotDePasse(),
                user.getRole(),
                Boolean.TRUE.equals(user.getActif()),
                Boolean.TRUE.equals(user.getDoitChangerMotDePasse())
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
