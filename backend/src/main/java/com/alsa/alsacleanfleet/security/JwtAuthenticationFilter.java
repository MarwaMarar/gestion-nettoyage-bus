package com.alsa.alsacleanfleet.security;

import com.alsa.alsacleanfleet.repository.UtilisateurRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UtilisateurRepository users;

    public JwtAuthenticationFilter(JwtService jwtService, UtilisateurRepository users) {
        this.jwtService = jwtService;
        this.users = users;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorization != null
                && authorization.startsWith("Bearer ")
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                Long userId = jwtService.extractUserId(authorization.substring(7));
                users.findById(userId)
                        .filter(user -> Boolean.TRUE.equals(user.getActif()))
                        .map(AuthenticatedUser::from)
                        .ifPresent(principal -> SecurityContextHolder.getContext().setAuthentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal,
                                        null,
                                        principal.getAuthorities()
                                )
                        ));
            } catch (RuntimeException ignored) {
                SecurityContextHolder.clearContext();
            }
        }
        filterChain.doFilter(request, response);
    }
}
