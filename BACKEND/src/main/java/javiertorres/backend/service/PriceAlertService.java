package javiertorres.backend.service;

import javiertorres.backend.dto.alert.PriceAlertCreateRequest;
import javiertorres.backend.dto.alert.PriceAlertResponse;
import javiertorres.backend.entity.Car;
import javiertorres.backend.entity.PriceAlert;
import javiertorres.backend.exception.ConflictException;
import javiertorres.backend.exception.ResourceNotFoundException;
import javiertorres.backend.repository.CarRepository;
import javiertorres.backend.repository.PriceAlertRepository;
import javiertorres.backend.repository.UserRepository;
import javiertorres.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Gli avvisi appartengono a un utente: lettura e cancellazione sono sempre vincolate
 * all'id preso dal JWT. L'avviso di un altro utente risulta inesistente (404), mai 403.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PriceAlertService {

    private static final String NOT_FOUND_MESSAGE = "Avviso non trovato";

    private final PriceAlertRepository priceAlertRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<PriceAlertResponse> findAll(UserPrincipal caller) {
        return priceAlertRepository.findAllByUserIdWithCar(caller.id()).stream()
                .map(PriceAlertResponse::from)
                .toList();
    }

    @Transactional
    public PriceAlertResponse create(PriceAlertCreateRequest request, UserPrincipal caller) {
        Car car = carRepository.findByIdAndIsBozzaFalse(request.carId())
                .orElseThrow(() -> new ResourceNotFoundException("Auto non trovata"));

        if (priceAlertRepository.existsByUserIdAndCarId(caller.id(), car.getId())) {
            throw new ConflictException("Esiste già un avviso per questa auto");
        }

        // unsubscribeToken e inviato=false sono impostati dall'entità: mai accettati dal client
        // saveAndFlush: createdAt è generato da Hibernate al flush
        PriceAlert alert = priceAlertRepository.saveAndFlush(PriceAlert.builder()
                .user(userRepository.getReferenceById(caller.id()))
                .car(car)
                .sogliaPrezzo(request.sogliaPrezzo())
                .build());

        log.debug("Avviso creato: id={}, userId={}, soglia={}", alert.getId(), caller.id(), alert.getSogliaPrezzo());
        return PriceAlertResponse.from(alert);
    }

    /** DELETE condizionato sull'owner: 0 righe significa "non esiste per questo utente" → 404. */
    @Transactional
    public void delete(UUID id, UserPrincipal caller) {
        if (priceAlertRepository.deleteByIdAndUserId(id, caller.id()) == 0) {
            throw new ResourceNotFoundException(NOT_FOUND_MESSAGE);
        }
    }

    /**
     * Disiscrizione dal link ricevuto via mail: il token UUID è l'unica credenziale,
     * quindi non si risale mai all'utente né si espongono altri suoi dati.
     */
    @Transactional
    public void unsubscribe(UUID unsubscribeToken) {
        if (priceAlertRepository.deleteByUnsubscribeToken(unsubscribeToken) == 0) {
            throw new ResourceNotFoundException(NOT_FOUND_MESSAGE);
        }
        log.info("Disiscrizione effettuata tramite token");
    }
}
