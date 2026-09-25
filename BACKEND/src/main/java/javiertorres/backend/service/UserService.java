package javiertorres.backend.service;

import javiertorres.backend.dto.user.UserResponse;
import javiertorres.backend.entity.User;
import javiertorres.backend.entity.enums.Role;
import javiertorres.backend.exception.ConflictException;
import javiertorres.backend.exception.ResourceNotFoundException;
import javiertorres.backend.repository.FavoriteRepository;
import javiertorres.backend.repository.PriceAlertRepository;
import javiertorres.backend.repository.UserRepository;
import javiertorres.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FavoriteRepository favoriteRepository;
    private final PriceAlertRepository priceAlertRepository;

    /** L'identità arriva dal JWT: non esiste un endpoint per leggere il profilo di un altro utente. */
    @Transactional(readOnly = true)
    public UserResponse getCurrent(UserPrincipal caller) {
        return UserResponse.from(loadUser(caller.id()));
    }

    /**
     * Cancella l'utente e tutto ciò che gli appartiene. Le dipendenze sono rimosse esplicitamente
     * prima dell'utente: l'ordine è deterministico e non dipende dal cascade del DB.
     */
    @Transactional
    public void deleteCurrent(UserPrincipal caller) {
        User user = loadUser(caller.id());

        // Un salone senza amministratori sarebbe irrecuperabile
        if (user.getRole() == Role.ADMIN && userRepository.countByRole(Role.ADMIN) <= 1) {
            throw new ConflictException("Impossibile eliminare l'unico account amministratore");
        }

        int alerts = priceAlertRepository.deleteAllByUserId(user.getId());
        int favorites = favoriteRepository.deleteAllByUserId(user.getId());
        userRepository.delete(user);

        log.info("Utente eliminato: id={}, avvisi={}, preferiti={}", user.getId(), alerts, favorites);
    }

    private User loadUser(UUID id) {
        return userRepository.findById(id)
                // Token ancora valido ma utente già cancellato
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato"));
    }
}
