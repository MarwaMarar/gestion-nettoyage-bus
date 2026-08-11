package com.alsa.alsacleanfleet.service;

import com.alsa.alsacleanfleet.dto.TypeNettoyageDTO;
import com.alsa.alsacleanfleet.entity.TypeNettoyage;
import com.alsa.alsacleanfleet.exception.DuplicateResourceException;
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
        type.setFrequence(input.frequence().trim());
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
        type.setFrequence(input.frequence().trim());
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
}
