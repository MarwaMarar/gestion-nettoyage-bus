package com.alsa.alsacleanfleet.service;

import com.alsa.alsacleanfleet.dto.BusExclusionRequestDTO;
import com.alsa.alsacleanfleet.dto.BusExclusionResponseDTO;
import com.alsa.alsacleanfleet.entity.Bus;
import com.alsa.alsacleanfleet.entity.BusExclusion;
import com.alsa.alsacleanfleet.enums.TypeExclusionBus;
import com.alsa.alsacleanfleet.exception.BusinessException;
import com.alsa.alsacleanfleet.exception.ResourceNotFoundException;
import com.alsa.alsacleanfleet.repository.BusExclusionRepository;
import com.alsa.alsacleanfleet.repository.BusRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class BusExclusionService {
    private final BusExclusionRepository exclusions;
    private final BusRepository bus;

    public BusExclusionService(BusExclusionRepository exclusions, BusRepository bus) {
        this.exclusions = exclusions;
        this.bus = bus;
    }

    @Transactional(readOnly = true)
    public List<BusExclusionResponseDTO> findAll(TypeExclusionBus type) {
        List<BusExclusion> values = type == null
                ? exclusions.findAllByOrderByBusNumeroBusAsc()
                : exclusions.findByTypeOrderByBusNumeroBusAsc(type);
        return values.stream().map(this::dto).toList();
    }

    public BusExclusionResponseDTO create(BusExclusionRequestDTO request) {
        Bus selectedBus = bus.findByIdForUpdate(request.busId())
                .orElseThrow(() -> new ResourceNotFoundException("Bus introuvable"));
        if (exclusions.existsByBusId(selectedBus.getId())) {
            throw new BusinessException("Ce bus figure deja dans une liste d'exclusion");
        }
        selectedBus.setActif(false);
        bus.save(selectedBus);
        BusExclusion exclusion = new BusExclusion();
        exclusion.setBus(selectedBus);
        exclusion.setType(request.type());
        return dto(exclusions.save(exclusion));
    }

    public void delete(Long id) {
        BusExclusion exclusion = exclusions.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exclusion de bus introuvable"));
        exclusions.delete(exclusion);
    }

    private BusExclusionResponseDTO dto(BusExclusion value) {
        return new BusExclusionResponseDTO(value.getId(), value.getBus().getId(),
                value.getBus().getNumeroBus(), value.getBus().getTypeBus().getLibelle(), value.getType());
    }
}
