package javiertorres.backend.service;

import javiertorres.backend.dto.favorite.FavoriteCreateRequest;
import javiertorres.backend.dto.favorite.FavoriteResponse;
import javiertorres.backend.entity.Car;
import javiertorres.backend.entity.Favorite;
import javiertorres.backend.exception.ConflictException;
import javiertorres.backend.exception.ResourceNotFoundException;
import javiertorres.backend.repository.CarRepository;
import javiertorres.backend.repository.FavoriteRepository;
import javiertorres.backend.repository.UserRepository;
import javiertorres.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * I preferiti sono risorse dell'utente: ogni lettura e ogni cancellazione filtra per
 * l'id preso dal JWT. Un preferito di un altro utente risulta inesistente (404), mai 403.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FavoriteService {

    private static final String NOT_FOUND_MESSAGE = "Preferito non trovato";

    private final FavoriteRepository favoriteRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<FavoriteResponse> findAll(UserPrincipal caller) {
        return favoriteRepository.findAllVisibleByUserId(caller.id()).stream()
                .map(FavoriteResponse::from)
                .toList();
    }

    @Transactional
    public FavoriteResponse create(FavoriteCreateRequest request, UserPrincipal caller) {
        // Le bozze non sono visibili all'utente: aggiungerle ai preferiti ne rivelerebbe l'esistenza
        Car car = carRepository.findByIdAndIsBozzaFalse(request.carId())
                .orElseThrow(() -> new ResourceNotFoundException("Auto non trovata"));

        if (favoriteRepository.existsByUserIdAndCarId(caller.id(), car.getId())) {
            throw new ConflictException("Auto già presente nei preferiti");
        }

        // Reference proxy: nessuna SELECT inutile, l'utente è già autenticato
        // saveAndFlush: createdAt è generato da Hibernate al flush
        Favorite favorite = favoriteRepository.saveAndFlush(Favorite.builder()
                .user(userRepository.getReferenceById(caller.id()))
                .car(car)
                .build());

        log.debug("Preferito creato: id={}, userId={}", favorite.getId(), caller.id());
        return FavoriteResponse.from(favorite);
    }

    /** DELETE condizionato sull'owner: 0 righe significa "non esiste per questo utente" → 404. */
    @Transactional
    public void delete(UUID id, UserPrincipal caller) {
        if (favoriteRepository.deleteByIdAndUserId(id, caller.id()) == 0) {
            throw new ResourceNotFoundException(NOT_FOUND_MESSAGE);
        }
    }
}
