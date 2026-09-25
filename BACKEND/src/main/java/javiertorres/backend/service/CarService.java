package javiertorres.backend.service;

import javiertorres.backend.dto.car.CarAdminResponse;
import javiertorres.backend.dto.car.CarCreateRequest;
import javiertorres.backend.dto.car.CarResponse;
import javiertorres.backend.dto.car.CarSearchCriteria;
import javiertorres.backend.dto.car.CarUpdateRequest;
import javiertorres.backend.dto.car.CarView;
import javiertorres.backend.dto.common.PageResponse;
import javiertorres.backend.entity.Car;
import javiertorres.backend.event.CarPriceChangedEvent;
import javiertorres.backend.exception.BadRequestException;
import javiertorres.backend.exception.ResourceNotFoundException;
import javiertorres.backend.repository.CarRepository;
import javiertorres.backend.repository.specification.CarSpecifications;
import javiertorres.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CarService {

    public static final int MAX_PAGE_SIZE = 100;

    private static final String NOT_FOUND_MESSAGE = "Auto non trovata";

    private final CarRepository carRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Catalogo paginato. Per i non ADMIN: bozze escluse a livello di query e
     * prezzo d'acquisto rimosso a livello di DTO.
     *
     * @param caller null se la richiesta è anonima
     */
    @Transactional(readOnly = true)
    public PageResponse<CarView> search(CarSearchCriteria criteria, @Nullable String sortBy, @Nullable String direction,
                                        int page, int size, @Nullable UserPrincipal caller) {
        boolean admin = isAdmin(caller);

        PageRequest pageRequest = PageRequest.of(
                Math.max(page, 0),
                Math.clamp(size, 1, MAX_PAGE_SIZE),
                resolveSort(sortBy, direction, admin));

        return PageResponse.from(carRepository
                .findAll(CarSpecifications.fromCriteria(criteria, admin), pageRequest)
                .map(car -> toView(car, admin)));
    }

    /** Per i non ADMIN una bozza risulta inesistente: 404. */
    @Transactional(readOnly = true)
    public CarView getById(UUID id, @Nullable UserPrincipal caller) {
        boolean admin = isAdmin(caller);
        Car car = (admin ? carRepository.findById(id) : carRepository.findByIdAndIsBozzaFalse(id))
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MESSAGE));
        return toView(car, admin);
    }

    /** Oltre alla regola URL nella SecurityFilterChain: difesa in profondità a livello di service. */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public CarAdminResponse create(CarCreateRequest request) {
        // saveAndFlush: i timestamp generati da Hibernate esistono solo dopo il flush
        Car car = carRepository.saveAndFlush(Car.builder()
                .marca(request.marca())
                .modello(request.modello())
                .descrizione(request.descrizione())
                .prezzoAcquisto(request.prezzoAcquisto())
                .prezzoVendita(request.prezzoVendita())
                .isBozza(request.isBozza())
                .build());

        log.info("Auto creata: id={}", car.getId());
        return CarAdminResponse.from(car);
    }

    /**
     * Se il prezzo di vendita scende pubblica {@link CarPriceChangedEvent}. L'evento è consegnato ai
     * listener solo dopo il commit (AFTER_COMMIT): in caso di rollback nessuna mail parte.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public CarAdminResponse update(UUID id, CarUpdateRequest request) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MESSAGE));

        BigDecimal prezzoPrecedente = car.getPrezzoVendita();

        car.setMarca(request.marca());
        car.setModello(request.modello());
        car.setDescrizione(request.descrizione());
        car.setPrezzoAcquisto(request.prezzoAcquisto());
        car.setPrezzoVendita(request.prezzoVendita());
        car.setIsBozza(request.isBozza());

        // Flush esplicito: un conflitto di @Version emerge qui (→ 409) e non dopo la pubblicazione dell'evento
        Car saved = carRepository.saveAndFlush(car);

        if (saved.getPrezzoVendita().compareTo(prezzoPrecedente) < 0) {
            log.info("Prezzo ribassato per auto id={}: {} → {}", saved.getId(), prezzoPrecedente, saved.getPrezzoVendita());
            eventPublisher.publishEvent(
                    new CarPriceChangedEvent(saved.getId(), prezzoPrecedente, saved.getPrezzoVendita()));
        }

        return CarAdminResponse.from(saved);
    }

    /**
     * Whitelist esplicita dei campi ordinabili: il valore utente viene solo confrontato con
     * costanti note, mai concatenato in query. Tie-breaker su id per una paginazione stabile.
     */
    private static Sort resolveSort(@Nullable String sortBy, @Nullable String direction, boolean admin) {
        Sort.Direction sortDirection = switch (direction == null ? "asc" : direction.toLowerCase(Locale.ROOT)) {
            case "asc" -> Sort.Direction.ASC;
            case "desc" -> Sort.Direction.DESC;
            default -> throw new BadRequestException("Direzione di ordinamento non valida: ammessi 'asc' o 'desc'");
        };

        String property = switch (sortBy == null ? "recenti" : sortBy.toLowerCase(Locale.ROOT)) {
            case "prezzo", "prezzovendita" -> "prezzoVendita";
            case "marca" -> "marca";
            case "modello" -> "modello";
            case "recenti", "createdat" -> "createdAt";
            case "prezzoacquisto" -> {
                if (!admin) {
                    throw new BadRequestException("Campo di ordinamento non ammesso");
                }
                yield "prezzoAcquisto";
            }
            default -> throw new BadRequestException(
                    "Campo di ordinamento non ammesso: usare prezzo, marca, modello o recenti");
        };

        // "recenti" senza direzione esplicita → più recenti prima
        if (direction == null && "createdAt".equals(property)) {
            sortDirection = Sort.Direction.DESC;
        }

        return Sort.by(sortDirection, property).and(Sort.by(Sort.Direction.ASC, "id"));
    }

    private static boolean isAdmin(@Nullable UserPrincipal caller) {
        return caller != null && caller.isAdmin();
    }

    private static CarView toView(Car car, boolean admin) {
        return admin ? CarAdminResponse.from(car) : CarResponse.from(car);
    }
}
