package com.alsa.alsacleanfleet.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.alsa.alsacleanfleet.entity.TypeBus;
import com.alsa.alsacleanfleet.repository.TypeBusRepository;

@Service
public class TypeBusService {

    private final TypeBusRepository typeBusRepository;

    public TypeBusService(TypeBusRepository typeBusRepository) {
        this.typeBusRepository = typeBusRepository;
    }

    public List<TypeBus> getAllTypes() {
        return typeBusRepository.findAll();
    }

    public TypeBus ajouterType(TypeBus typeBus) {
        return typeBusRepository.save(typeBus);
    }

    public Optional<TypeBus> modifierType(Long id, TypeBus typeBusDetails) {
        return typeBusRepository.findById(id)
                .map(existing -> {
                    existing.setLibelle(typeBusDetails.getLibelle());
                    return typeBusRepository.save(existing);
                });
    }

    public boolean supprimerType(Long id) {
        if (typeBusRepository.existsById(id)) {
            typeBusRepository.deleteById(id);
            return true;
        }
        return false;
    }
}