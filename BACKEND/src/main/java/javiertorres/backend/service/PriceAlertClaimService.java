package javiertorres.backend.service;

import javiertorres.backend.repository.PriceAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Claim dell'invio in una transazione propria e brevissima, committata PRIMA della chiamata SMTP:
 * due esecuzioni concorrenti non possono ottenere entrambe la riga, quindi la mail parte una volta sola.
 * Bean separato perché una chiamata interna non passerebbe dal proxy e REQUIRES_NEW verrebbe ignorato.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PriceAlertClaimService {

    private final PriceAlertRepository priceAlertRepository;

    /** @return true se questa esecuzione ha ottenuto il diritto di inviare la mail */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean claim(UUID alertId) {
        return priceAlertRepository.markAsSent(alertId) == 1;
    }

    /** Compensazione dopo un fallimento SMTP: l'avviso torna attivo. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void release(UUID alertId) {
        if (priceAlertRepository.releaseSentClaim(alertId) == 1) {
            log.warn("Claim rilasciato per avviso id={}: la notifica potrà essere ritentata", alertId);
        }
    }
}
