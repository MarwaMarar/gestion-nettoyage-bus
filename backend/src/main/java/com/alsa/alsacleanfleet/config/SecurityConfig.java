package com.alsa.alsacleanfleet.config;

import com.alsa.alsacleanfleet.security.JwtAuthenticationFilter;
import com.alsa.alsacleanfleet.security.PasswordChangeEnforcementFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    UserDetailsService userDetailsService(com.alsa.alsacleanfleet.repository.UtilisateurRepository users) {
        return login -> users
                .findByLoginIgnoreCase(login)
                .map(com.alsa.alsacleanfleet.security.AuthenticatedUser::from)
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException(
                        "Utilisateur introuvable"
                ));
    }

    @Bean
    AuthenticationManager authenticationManager(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtFilter,
            PasswordChangeEnforcementFilter passwordChangeFilter
    ) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((request, response, exception) ->
                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED))
                        .accessDeniedHandler((request, response, exception) ->
                                response.sendError(HttpServletResponse.SC_FORBIDDEN)))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/change-password").authenticated()
                        .requestMatchers("/api/auth/me").authenticated()

                        .requestMatchers(HttpMethod.GET, "/api/bus/actifs")
                        .hasAnyRole("NETTOYEUR", "ADMINISTRATEUR", "CONSULTANT")
                        .requestMatchers(HttpMethod.GET, "/api/bus", "/api/bus/*")
                        .hasAnyRole("ADMINISTRATEUR", "CONSULTANT")
                        .requestMatchers("/api/bus/**").hasRole("ADMINISTRATEUR")

                        .requestMatchers(HttpMethod.GET, "/api/types-nettoyage", "/api/types-nettoyage/*")
                        .authenticated()
                        .requestMatchers("/api/types-nettoyage/**").hasRole("ADMINISTRATEUR")
                        .requestMatchers(HttpMethod.GET, "/api/types-bus", "/api/types-bus/*")
                        .hasAnyRole("ADMINISTRATEUR", "CONSULTANT")
                        .requestMatchers("/api/types-bus/**").hasRole("ADMINISTRATEUR")
                        .requestMatchers(HttpMethod.GET, "/api/utilisateurs", "/api/utilisateurs/*")
                        .hasAnyRole("ADMINISTRATEUR", "CONSULTANT")
                        .requestMatchers("/api/utilisateurs/**").hasRole("ADMINISTRATEUR")

                        .requestMatchers(HttpMethod.GET, "/api/nettoyages", "/api/nettoyages/statistiques",
                                "/api/nettoyages/admin/nettoyeur/page", "/api/nettoyages/admin/superviseur/page")
                        .hasAnyRole("ADMINISTRATEUR", "CONSULTANT")
                        .requestMatchers("/api/nettoyages/commencer", "/api/nettoyages/mes-nettoyages")
                        .hasAnyRole("NETTOYEUR", "ADMINISTRATEUR")
                        .requestMatchers("/api/nettoyages/*/terminer")
                        .hasAnyRole("NETTOYEUR", "ADMINISTRATEUR")
                        .requestMatchers("/api/nettoyages/en-attente", "/api/nettoyages/*/valider",
                                "/api/nettoyages/*/refuser")
                        .hasAnyRole("SUPERVISEUR", "ADMINISTRATEUR")
                        .requestMatchers(HttpMethod.GET, "/api/nettoyages/*").authenticated()
                        .requestMatchers("/api/nettoyages/**").hasRole("ADMINISTRATEUR")
                        .requestMatchers(HttpMethod.POST, "/api/**")
                        .hasAnyRole("ADMINISTRATEUR", "NETTOYEUR", "SUPERVISEUR")
                        .requestMatchers(HttpMethod.PUT, "/api/**")
                        .hasAnyRole("ADMINISTRATEUR", "NETTOYEUR", "SUPERVISEUR")
                        .requestMatchers(HttpMethod.PATCH, "/api/**")
                        .hasAnyRole("ADMINISTRATEUR", "NETTOYEUR", "SUPERVISEUR")
                        .requestMatchers(HttpMethod.DELETE, "/api/**")
                        .hasAnyRole("ADMINISTRATEUR", "NETTOYEUR", "SUPERVISEUR")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterAfter(passwordChangeFilter, JwtAuthenticationFilter.class);
        return http.build();
    }
}
