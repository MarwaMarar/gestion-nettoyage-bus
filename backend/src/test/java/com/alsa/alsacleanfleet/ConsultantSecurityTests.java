package com.alsa.alsacleanfleet;

import com.alsa.alsacleanfleet.entity.Utilisateur;
import com.alsa.alsacleanfleet.enums.Role;
import com.alsa.alsacleanfleet.repository.UtilisateurRepository;
import com.alsa.alsacleanfleet.security.AuthenticatedUser;
import com.alsa.alsacleanfleet.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ConsultantSecurityTests {
    @Autowired MockMvc mvc;
    @Autowired UtilisateurRepository users;
    @Autowired JwtService jwtService;

    @Test
    void consultantCanLoginAndReadButCannotWrite() throws Exception {
        Utilisateur admin = users.findByRoleAndActifTrue(Role.ADMINISTRATEUR).stream().findFirst().orElseThrow();
        String adminBearer = "Bearer " + jwtService.generate(AuthenticatedUser.from(admin));
        mvc.perform(post("/api/utilisateurs").header("Authorization", adminBearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nom\":\"Consultant\",\"prenom\":\"Test\","
                                + "\"matricule\":\"CONSULTANT-SECURITY-TEST\","
                                + "\"email\":\"consultant-security-test@alsa.local\","
                                + "\"login\":\"consultant-security-test\","
                                + "\"motDePasse\":\"ConsultantTest2026!\",\"role\":\"CONSULTANT\",\"actif\":true}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("CONSULTANT"));
        Utilisateur consultant = users.findByLoginIgnoreCase("consultant-security-test").orElseThrow();
        for (String[] account : new String[][]{
                {"TEMP-NETTOYEUR-TEST", "temp-nettoyeur-test", "NETTOYEUR"},
                {"TEMP-SUPERVISEUR-TEST", "temp-superviseur-test", "SUPERVISEUR"},
                {"TEMP-ADMIN-TEST", "temp-admin-test", "ADMINISTRATEUR"}
        }) {
            mvc.perform(post("/api/utilisateurs").header("Authorization", adminBearer)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"nom\":\"Temp\",\"prenom\":\"Test\",\"matricule\":\"" + account[0]
                                    + "\",\"email\":\"" + account[1] + "@alsa.local\",\"login\":\"" + account[1]
                                    + "\",\"motDePasse\":\"Temporaire2026!\",\"role\":\"" + account[2] + "\",\"actif\":true}"))
                    .andExpect(status().isCreated());
        }
        org.junit.jupiter.api.Assertions.assertTrue(users.findByLoginIgnoreCase("temp-nettoyeur-test").orElseThrow().getDoitChangerMotDePasse());
        org.junit.jupiter.api.Assertions.assertTrue(users.findByLoginIgnoreCase("temp-superviseur-test").orElseThrow().getDoitChangerMotDePasse());
        org.junit.jupiter.api.Assertions.assertFalse(users.findByLoginIgnoreCase("temp-admin-test").orElseThrow().getDoitChangerMotDePasse());

        mvc.perform(post("/api/utilisateurs").header("Authorization", adminBearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nom\":\"Autre\",\"prenom\":\"Compte\","
                                + "\"matricule\":\"CONSULTANT-DUPLICATE-TEST\","
                                + "\"email\":\"consultant-duplicate-test@alsa.local\","
                                + "\"login\":\"  CONSULTANT-SECURITY-TEST  \","
                                + "\"motDePasse\":\"ConsultantTest2026!\",\"role\":\"CONSULTANT\",\"actif\":true}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Ce login est déjà utilisé"));

        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"login\":\"consultant-security-test\",\"motDePasse\":\"ConsultantTest2026!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.utilisateur.role").value("CONSULTANT"))
                .andExpect(jsonPath("$.mustChangePassword").value(true));

        String temporaryBearer = "Bearer " + jwtService.generate(AuthenticatedUser.from(consultant));
        mvc.perform(get("/api/nettoyages").header("Authorization", temporaryBearer)).andExpect(status().isForbidden());
        for (String body : new String[]{
                "{\"newPassword\":\"simple1!\",\"confirmPassword\":\"simple1!\"}",
                "{\"newPassword\":\"Simple!\",\"confirmPassword\":\"Simple!\"}",
                "{\"newPassword\":\"Simple1\",\"confirmPassword\":\"Simple1\"}",
                "{\"newPassword\":\"Nouveau2026!\",\"confirmPassword\":\"Different2026!\"}",
                "{\"newPassword\":\"ConsultantTest2026!\",\"confirmPassword\":\"ConsultantTest2026!\"}"
        }) {
            mvc.perform(post("/api/auth/change-password").header("Authorization", temporaryBearer)
                            .contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isBadRequest());
        }
        mvc.perform(post("/api/auth/change-password").header("Authorization", temporaryBearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"newPassword\":\"Nouveau2026!\",\"confirmPassword\":\"Nouveau2026!\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.mustChangePassword").value(false));
        mvc.perform(get("/api/auth/me").header("Authorization", temporaryBearer)).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"login\":\"consultant-security-test\",\"motDePasse\":\"ConsultantTest2026!\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"login\":\"consultant-security-test\",\"motDePasse\":\"Nouveau2026!\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.mustChangePassword").value(false));
        consultant = users.findById(consultant.getId()).orElseThrow();
        String bearer = "Bearer " + jwtService.generate(AuthenticatedUser.from(consultant));
        for (String endpoint : new String[]{"/api/auth/me", "/api/nettoyages", "/api/nettoyages/statistiques",
                "/api/bus", "/api/utilisateurs", "/api/types-bus", "/api/types-nettoyage"}) {
            mvc.perform(get(endpoint).header("Authorization", bearer)).andExpect(status().isOk());
        }
        Long nettoyeurId = users.findByRoleAndActifTrue(Role.NETTOYEUR).getFirst().getId();
        Long superviseurId = users.findByRoleAndActifTrue(Role.SUPERVISEUR).getFirst().getId();
        mvc.perform(get("/api/nettoyages/admin/nettoyeur/page").param("userId", nettoyeurId.toString())
                        .header("Authorization", bearer)).andExpect(status().isOk());
        mvc.perform(get("/api/nettoyages/admin/superviseur/page").param("userId", superviseurId.toString())
                        .header("Authorization", bearer)).andExpect(status().isOk());
        String cleanerBearer = "Bearer " + jwtService.generate(AuthenticatedUser.from(users.findById(nettoyeurId).orElseThrow()));
        String supervisorBearer = "Bearer " + jwtService.generate(AuthenticatedUser.from(users.findById(superviseurId).orElseThrow()));
        mvc.perform(get("/api/bus/actifs").header("Authorization", cleanerBearer)).andExpect(status().isOk());
        mvc.perform(get("/api/nettoyages/en-attente").header("Authorization", supervisorBearer)).andExpect(status().isOk());

        mvc.perform(post("/api/bus").header("Authorization", bearer).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
        mvc.perform(put("/api/bus/1").header("Authorization", bearer).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/api/bus/1").header("Authorization", bearer).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
        mvc.perform(delete("/api/bus/1").header("Authorization", bearer))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/nettoyages/commencer").header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"nettoyageId\":1}"))
                .andExpect(status().isForbidden());
    }
}
