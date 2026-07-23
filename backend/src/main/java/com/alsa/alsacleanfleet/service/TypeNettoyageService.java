package com.alsa.alsacleanfleet.service;

import com.alsa.alsacleanfleet.entity.TypeNettoyage;
import com.alsa.alsacleanfleet.repository.TypeNettoyageRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TypeNettoyageService {
    private final TypeNettoyageRepository repository;
    public TypeNettoyageService(TypeNettoyageRepository repository) { this.repository = repository; }
    public List<TypeNettoyage> findAll() { return repository.findAll(); }
    public Optional<TypeNettoyage> findById(Long id) { return repository.findById(id); }
    public TypeNettoyage create(TypeNettoyage type) { return repository.save(type); }
    public Optional<TypeNettoyage> update(Long id, TypeNettoyage input) {
        return repository.findById(id).map(type -> {
            type.setLibelle(input.getLibelle()); type.setDescription(input.getDescription());
            return repository.save(type);
        });
    }
    public boolean delete(Long id) {
        if (!repository.existsById(id)) return false;
        repository.deleteById(id); return true;
    }
}
