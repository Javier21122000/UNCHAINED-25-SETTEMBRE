package javiertorres.backend.controller;

import jakarta.validation.Valid;
import javiertorres.backend.dto.favorite.FavoriteCreateRequest;
import javiertorres.backend.dto.favorite.FavoriteResponse;
import javiertorres.backend.security.UserPrincipal;
import javiertorres.backend.service.FavoriteService;
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

/** Tutte le rotte operano sui preferiti del solo utente autenticato. */
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public List<FavoriteResponse> findAll(@AuthenticationPrincipal UserPrincipal caller) {
        return favoriteService.findAll(caller);
    }

    @PostMapping
    public ResponseEntity<FavoriteResponse> create(@Valid @RequestBody FavoriteCreateRequest request,
                                                   @AuthenticationPrincipal UserPrincipal caller) {
        FavoriteResponse created = favoriteService.create(request, caller);
        return ResponseEntity.created(URI.create("/api/favorites/" + created.id())).body(created);
    }

    /** Preferito di un altro utente → 404, per non rivelarne l'esistenza. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal caller) {
        favoriteService.delete(id, caller);
        return ResponseEntity.noContent().build();
    }
}
