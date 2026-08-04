package com.alsa.alsacleanfleet.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class PasswordChangeEnforcementFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        Object principal = SecurityContextHolder.getContext().getAuthentication() == null ? null
                : SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof AuthenticatedUser user && user.mustChangePassword()) {
            String path = request.getRequestURI();
            boolean allowed = path.equals("/api/auth/me") || path.equals("/api/auth/change-password");
            if (!allowed) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Changement de mot de passe obligatoire");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}
