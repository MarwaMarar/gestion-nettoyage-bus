package com.alsa.alsacleanfleet.service;
import com.alsa.alsacleanfleet.dto.NotificationResponseDTO;
import com.alsa.alsacleanfleet.entity.*;
import com.alsa.alsacleanfleet.exception.ResourceNotFoundException;
import com.alsa.alsacleanfleet.repository.NotificationRepository;
import com.alsa.alsacleanfleet.security.AuthenticatedUser;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
@Service @Transactional
public class NotificationService {
    private final NotificationRepository repo;
    public NotificationService(NotificationRepository repo){this.repo=repo;}
    public void create(Utilisateur recipient, Nettoyage cleaning, String message){if(recipient==null)return;if(cleaning!=null&&repo.existsByDestinataireIdAndNettoyageIdAndMessageAndLueFalse(recipient.getId(),cleaning.getId(),message))return;Notification n=new Notification();n.setDestinataire(recipient);n.setNettoyage(cleaning);n.setMessage(message);n.setDateCreation(LocalDateTime.now());repo.save(n);}
    @Transactional(readOnly=true) public List<NotificationResponseDTO> mine(AuthenticatedUser user){return repo.findByDestinataireIdOrderByDateCreationDesc(user.id()).stream().map(this::dto).toList();}
    public NotificationResponseDTO read(Long id,AuthenticatedUser user){Notification n=repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Notification introuvable"));if(!n.getDestinataire().getId().equals(user.id()))throw new AccessDeniedException("Notification interdite");n.setLue(true);return dto(n);}
    public void readAll(AuthenticatedUser user){repo.findByDestinataireIdOrderByDateCreationDesc(user.id()).forEach(n->n.setLue(true));}
    public void delete(Long id,AuthenticatedUser user){Notification n=repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Notification introuvable"));if(!n.getDestinataire().getId().equals(user.id()))throw new AccessDeniedException("Notification interdite");repo.delete(n);}
    public void deleteAll(AuthenticatedUser user){repo.deleteByDestinataireId(user.id());}
    private NotificationResponseDTO dto(Notification n){return new NotificationResponseDTO(n.getId(),n.getNettoyage()==null?null:n.getNettoyage().getId(),n.getMessage(),n.isLue(),n.getDateCreation());}
}
