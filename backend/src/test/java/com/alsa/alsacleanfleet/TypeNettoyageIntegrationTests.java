package com.alsa.alsacleanfleet;

import com.alsa.alsacleanfleet.entity.Nettoyage;
import com.alsa.alsacleanfleet.entity.Utilisateur;
import com.alsa.alsacleanfleet.enums.Role;
import com.alsa.alsacleanfleet.repository.NettoyageRepository;
import com.alsa.alsacleanfleet.repository.UtilisateurRepository;
import com.alsa.alsacleanfleet.security.AuthenticatedUser;
import com.alsa.alsacleanfleet.security.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TypeNettoyageIntegrationTests {
    @Autowired MockMvc mvc;
    @Autowired UtilisateurRepository utilisateurs;
    @Autowired NettoyageRepository nettoyages;
    @Autowired JwtService jwtService;
    @Autowired ObjectMapper objectMapper;

    @Test
    void adminCanAddRejectDuplicatesAndDeleteOnlyUnusedTypes() throws Exception {
        String admin = bearer(Role.ADMINISTRATEUR);

        mvc.perform(post("/api/types-nettoyage").header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"libelle\":\"   \",\"description\":\"vide\",\"frequence\":\"Par jour\"}"))
                .andExpect(status().isBadRequest());

        String response = mvc.perform(post("/api/types-nettoyage").header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"libelle\":\"Type test intégration\",\"description\":\"Description facultative\",\"frequence\":\"Par jour\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.libelle").value("Type test intégration"))
                .andReturn().getResponse().getContentAsString();
        JsonNode created = objectMapper.readTree(response);
        long unusedId = created.get("id").asLong();

        mvc.perform(put("/api/types-nettoyage/{id}", unusedId).header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"libelle\":\"Type test modifié\",\"description\":\"Nouvelle description\",\"frequence\":\"Par jour\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.libelle").value("Type test modifié"))
                .andExpect(jsonPath("$.frequence").value("Par jour"));

        mvc.perform(post("/api/types-nettoyage").header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"libelle\":\"  TYPE TEST MODIFIÉ  \",\"frequence\":\"Par jour\"}"))
                .andExpect(status().isConflict());

        Nettoyage existingCleaning = nettoyages.findAll().stream().findFirst().orElseThrow();
        mvc.perform(delete("/api/types-nettoyage/{id}", existingCleaning.getTypeNettoyage().getId())
                        .header("Authorization", admin))
                .andExpect(status().isConflict());

        mvc.perform(delete("/api/types-nettoyage/{id}", unusedId).header("Authorization", admin))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/types-nettoyage/{id}", unusedId).header("Authorization", admin))
                .andExpect(status().isNotFound());

    }

    @Test
    void readsRemainAvailableButWritesAreAdminOnly() throws Exception {
        for (Role role : new Role[]{Role.CONSULTANT, Role.NETTOYEUR, Role.SUPERVISEUR}) {
            String token = bearer(role);
            mvc.perform(get("/api/types-nettoyage").header("Authorization", token))
                    .andExpect(status().isOk());
            mvc.perform(post("/api/types-nettoyage").header("Authorization", token)
                            .contentType(MediaType.APPLICATION_JSON).content("{\"libelle\":\"Interdit\",\"frequence\":\"Par jour\"}"))
                    .andExpect(status().isForbidden());
            mvc.perform(put("/api/types-nettoyage/1").header("Authorization", token)
                            .contentType(MediaType.APPLICATION_JSON).content("{\"libelle\":\"Interdit\",\"frequence\":\"Par jour\"}"))
                    .andExpect(status().isForbidden());
            mvc.perform(delete("/api/types-nettoyage/1").header("Authorization", token))
                    .andExpect(status().isForbidden());
        }
    }

    private String bearer(Role role) {
        Utilisateur user = utilisateurs.findByRoleAndActifTrue(role).stream().findFirst().orElseThrow();
        user.setDoitChangerMotDePasse(false);
        utilisateurs.saveAndFlush(user);
        return "Bearer " + jwtService.generate(AuthenticatedUser.from(user));
    }
}
