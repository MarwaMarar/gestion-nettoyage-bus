package com.alsa.alsacleanfleet.service;
import com.alsa.alsacleanfleet.dto.*; import com.alsa.alsacleanfleet.entity.*; import com.alsa.alsacleanfleet.exception.*; import com.alsa.alsacleanfleet.repository.*; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import java.util.*;
@Service @Transactional
public class BusService { private final BusRepository repo; private final TypeBusRepository types;
 public BusService(BusRepository r,TypeBusRepository t){repo=r;types=t;}
 @Transactional(readOnly=true) public List<BusResponseDTO> findAll(){return repo.findAll().stream().map(this::dto).toList();}
 @Transactional(readOnly=true) public BusResponseDTO findById(Long id){return dto(entity(id));}
 public BusResponseDTO create(BusRequestDTO d){check(d.numeroBus(),-1L);Bus b=new Bus();apply(b,d);return dto(repo.save(b));}
 public BusResponseDTO update(Long id,BusRequestDTO d){Bus b=entity(id);check(d.numeroBus(),id);apply(b,d);return dto(repo.save(b));}
 public void delete(Long id){Bus b=entity(id);b.setActif(false);repo.save(b);}
 public long count(){return repo.count();} private Bus entity(Long id){return repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Bus introuvable"));}
 private void check(String n,Long id){if(repo.existsByNumeroBusIgnoreCaseAndIdNot(n,id))throw new DuplicateResourceException("Numero de bus deja utilise");}
 private void apply(Bus b,BusRequestDTO d){b.setNumeroBus(d.numeroBus().trim());b.setTypeBus(types.findById(d.typeBusId()).orElseThrow(()->new ResourceNotFoundException("Type de bus introuvable")));b.setActif(d.actif()==null||d.actif());}
 private BusResponseDTO dto(Bus b){return new BusResponseDTO(b.getId(),b.getNumeroBus(),b.getTypeBus().getId(),b.getTypeBus().getLibelle(),b.getActif());}}
