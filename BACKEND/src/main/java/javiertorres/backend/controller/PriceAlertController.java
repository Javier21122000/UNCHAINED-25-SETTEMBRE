package javiertorres.backend.controller;

import jakarta.validation.Valid;
import javiertorres.backend.dto.alert.PriceAlertCreateRequest;
import javiertorres.backend.dto.alert.PriceAlertResponse;
import javiertorres.backend.dto.common.MessageResponse;
import javiertorres.backend.security.UserPrincipal;
import javiertorres.backend.service.PriceAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;
import java.util.UUID;

/** Tutte le rotte operano sugli avvisi del solo utente autenticato, tranne l'unsubscribe pubblico. */
@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class PriceAlertController {

    private final PriceAlertService priceAlertService;

    @GetMapping
    public List<PriceAlertResponse> findAll(@AuthenticationPrincipal UserPrincipal caller) {
        return priceAlertService.findAll(caller);
    }

    @PostMapping
    public ResponseEntity<PriceAlertResponse> create(@Valid @RequestBody PriceAlertCreateRequest request,
                                                     @AuthenticationPrincipal UserPrincipal caller) {
        PriceAlertResponse created = priceAlertService.create(request, caller);
        return ResponseEntity.created(URI.create("/api/alerts/" + created.id())).body(created);
    }

    /** Avviso di un altro utente → 404, per non rivelarne l'esistenza. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal caller) {
        priceAlertService.delete(id, caller);
        return ResponseEntity.noContent().build();
    }

    /**
     * Pubblico: raggiunto dal link nella mail, dove non esiste un token JWT.
     * Il token UUID è l'unica credenziale e vale per un solo avviso.
     */
    @GetMapping("/unsubscribe/{unsubscribeToken}")
    public MessageResponse unsubscribe(@PathVariable UUID unsubscribeToken) {
        priceAlertService.unsubscribe(unsubscribeToken);
        return new MessageResponse("Disiscrizione effettuata: non riceverai più avvisi per questa auto.");
    }
}
