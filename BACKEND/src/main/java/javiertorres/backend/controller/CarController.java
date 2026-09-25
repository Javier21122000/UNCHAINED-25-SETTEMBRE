package javiertorres.backend.controller;

import jakarta.validation.Valid;
import javiertorres.backend.dto.car.CarAdminResponse;
import javiertorres.backend.dto.car.CarCreateRequest;
import javiertorres.backend.dto.car.CarSearchCriteria;
import javiertorres.backend.dto.car.CarUpdateRequest;
import javiertorres.backend.dto.car.CarView;
import javiertorres.backend.dto.common.PageResponse;
import javiertorres.backend.security.UserPrincipal;
import javiertorres.backend.service.CarService;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.UUID;

/**
 * Lettura pubblica, scrittura riservata agli ADMIN (403 per gli USER, imposto sia dalla
 * SecurityFilterChain sia da @PreAuthorize sul service).
 */
@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarController {

    private final CarService carService;

    /**
     * Il chiamante può essere anonimo: in quel caso {@code caller} è null e la vista
     * restituita esclude bozze e prezzo d'acquisto.
     */
    @GetMapping
    public PageResponse<CarView> search(@Valid @ModelAttribute CarSearchCriteria criteria,
                                        @RequestParam(required = false) @Nullable String sortBy,
                                        @RequestParam(required = false) @Nullable String direction,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size,
                                        @AuthenticationPrincipal @Nullable UserPrincipal caller) {
        return carService.search(criteria, sortBy, direction, page, size, caller);
    }

    @GetMapping("/{id}")
    public CarView getById(@PathVariable UUID id, @AuthenticationPrincipal @Nullable UserPrincipal caller) {
        return carService.getById(id, caller);
    }

    @PostMapping
    public ResponseEntity<CarAdminResponse> create(@Valid @RequestBody CarCreateRequest request) {
        CarAdminResponse created = carService.create(request);
        return ResponseEntity.created(URI.create("/api/cars/" + created.id())).body(created);
    }

    /** Un ribasso del prezzo di vendita fa partire le notifiche agli iscritti (dopo il commit). */
    @PutMapping("/{id}")
    public CarAdminResponse update(@PathVariable UUID id, @Valid @RequestBody CarUpdateRequest request) {
        return carService.update(id, request);
    }
}
