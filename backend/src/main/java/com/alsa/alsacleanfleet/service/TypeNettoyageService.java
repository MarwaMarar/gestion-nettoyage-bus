package com.alsa.alsacleanfleet.service;

import com.alsa.alsacleanfleet.dto.TypeNettoyageDTO;
import com.alsa.alsacleanfleet.entity.TypeNettoyage;
import com.alsa.alsacleanfleet.exception.DuplicateResourceException;
import com.alsa.alsacleanfleet.exception.BusinessException;
import com.alsa.alsacleanfleet.exception.ResourceNotFoundException;
import com.alsa.alsacleanfleet.exception.WorkflowConflictException;
import com.alsa.alsacleanfleet.repository.NettoyageRepository;
import com.alsa.alsacleanfleet.repository.TypeNettoyageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TypeNettoyageService {
    private final TypeNettoyageRepository repository;
    private final NettoyageRepository nettoyageRepository;
    public TypeNettoyageService(TypeNettoyageRepository repository, NettoyageRepository nettoyageRepository) {
        this.repository = repository;
        this.nettoyageRepository = nettoyageRepository;
    }
    @Transactional(readOnly = true)
    public List<TypeNettoyageDTO> findAll() { return repository.findAll().stream().map(this::toDTO).toList(); }
    @Transactional(readOnly = true)
    public Optional<TypeNettoyageDTO> findById(Long id) { return repository.findById(id).map(this::toDTO); }
    public TypeNettoyageDTO create(TypeNettoyageDTO input) {
        String libelle = input.libelle().trim();
        if (repository.existsByLibelleIgnoreCase(libelle)) {
            throw new DuplicateResourceException("Un type de nettoyage avec ce libellé existe déjà");
        }
        TypeNettoyage type = new TypeNettoyage();
        type.setLibelle(libelle);
        type.setDescription(normalizeDescription(input.description()));
        type.setFrequence(normalizeFrequency(input.frequence()));
        return toDTO(repository.save(type));
    }
    public TypeNettoyageDTO update(Long id, TypeNettoyageDTO input) {
        TypeNettoyage type = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Type de nettoyage introuvable"));
        String libelle = input.libelle().trim();
        if (repository.existsByLibelleIgnoreCaseAndIdNot(libelle, id)) {
            throw new DuplicateResourceException("Un type de nettoyage avec ce libellé existe déjà");
        }
        type.setLibelle(libelle);
        type.setDescription(normalizeDescription(input.description()));
        type.setFrequence(normalizeFrequency(input.frequence()));
        return toDTO(repository.save(type));
    }
    public void delete(Long id) {
        TypeNettoyage type = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Type de nettoyage introuvable"));
        if (nettoyageRepository.existsByTypeNettoyageId(id)) {
            throw new WorkflowConflictException("Ce type est utilisé par un nettoyage et ne peut pas être supprimé");
        }
        repository.delete(type);
    }

    private TypeNettoyageDTO toDTO(TypeNettoyage type) {
        return new TypeNettoyageDTO(type.getId(), type.getLibelle(), type.getDescription(), type.getFrequence());
    }

    private String normalizeDescription(String description) {
        if (description == null || description.isBlank()) return null;
        return description.trim();
    }

    private String normalizeFrequency(String frequency) {
        String value = frequency.trim();
        if (value.equalsIgnoreCase("Selon besoin")) return "Selon besoin";
        if (value.matches("(?i)\\d+\\s+fois\\s*(?:par|/)\\s*jour")
                && !value.matches("(?i)1\\s+fois\\s*(?:par|/)\\s*jour")) {
            throw new BusinessException("Une fréquence journalière est limitée à 1 fois/jour");
        }
        if (NettoyageService.nextDueDate(value, java.time.LocalDate.now()).isEmpty()) {
            throw new BusinessException("La fréquence doit être au format 'N fois/jour', 'N fois/semaine', "
                    + "'N fois/mois', 'Tous les N mois' ou 'Selon besoin'");
        }
        return value;
    }
}
