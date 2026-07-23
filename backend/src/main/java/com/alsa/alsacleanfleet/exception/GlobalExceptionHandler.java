package com.alsa.alsacleanfleet.exception;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.*;
@RestControllerAdvice
public class GlobalExceptionHandler {
 @ExceptionHandler(ResourceNotFoundException.class) ResponseEntity<?> notFound(Exception e,HttpServletRequest r){return body(HttpStatus.NOT_FOUND,e.getMessage(),r);}
 @ExceptionHandler(DuplicateResourceException.class) ResponseEntity<?> conflict(Exception e,HttpServletRequest r){return body(HttpStatus.CONFLICT,e.getMessage(),r);}
 @ExceptionHandler({BusinessException.class,MethodArgumentNotValidException.class,HttpMessageNotReadableException.class}) ResponseEntity<?> bad(Exception e,HttpServletRequest r){
  String m=e instanceof MethodArgumentNotValidException v?v.getBindingResult().getFieldErrors().stream().map(x->x.getField()+": "+x.getDefaultMessage()).findFirst().orElse("Donnees invalides"):"Requete invalide: "+e.getMessage(); return body(HttpStatus.BAD_REQUEST,m,r);}
 @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<?> integrity(Exception e,HttpServletRequest r){return body(HttpStatus.CONFLICT,"Cette ressource est deja utilisee ou existe deja",r);}
 @ExceptionHandler(Exception.class) ResponseEntity<?> server(Exception e,HttpServletRequest r){return body(HttpStatus.INTERNAL_SERVER_ERROR,"Erreur interne du serveur",r);}
 private ResponseEntity<Map<String,Object>> body(HttpStatus s,String m,HttpServletRequest r){Map<String,Object>b=new LinkedHashMap<>();b.put("timestamp",Instant.now());b.put("status",s.value());b.put("error",s.getReasonPhrase());b.put("message",m);b.put("path",r.getRequestURI());return ResponseEntity.status(s).body(b);}
}
