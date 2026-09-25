package javiertorres.backend.service;

import javiertorres.backend.entity.PriceAlert;
import javiertorres.backend.event.CarPriceChangedEvent;
import javiertorres.backend.repository.PriceAlertRepository;
import javiertorres.backend.util.LogSanitizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Notifica gli utenti iscritti dopo un ribasso. Volutamente NON transazionale: ogni avviso
 * viene claimato e spedito in modo indipendente, così un fallimento SMTP su un destinatario
 * non annulla le notifiche già inviate agli altri.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PriceAlertNotificationService {

    private final PriceAlertRepository priceAlertRepository;
    private final PriceAlertClaimService claimService;
    private final MailService mailService;

    public void notifySubscribers(CarPriceChangedEvent event) {
        // Solo gli avvisi attraversati: soglia sotto il prezzo precedente e raggiunta da quello attuale
        List<PriceAlert> pending =
                priceAlertRepository.findPendingTriggered(event.carId(), event.prezzoPrecedente());

        if (pending.isEmpty()) {
            log.debug("Nessun avviso da notificare per auto id={}", event.carId());
            return;
        }

        int sent = 0;
        for (PriceAlert alert : pending) {
            if (send(alert, event)) {
                sent++;
            }
        }

        log.info("Notifiche di ribasso per auto id={}: {} inviate su {} candidate",
                event.carId(), sent, pending.size());
    }

    private boolean send(PriceAlert alert, CarPriceChangedEvent event) {
        // Chi non ottiene il claim non invia: è già stato notificato da un'altra esecuzione
        if (!claimService.claim(alert.getId())) {
            return false;
        }

        try {
            mailService.sendPriceDropNotification(alert, event.prezzoPrecedente());
            return true;
        } catch (MailException ex) {
            // JavaMail cita il destinatario nell'errore: mai in chiaro nei log
            log.error("Invio fallito per avviso id={}: {}", alert.getId(), LogSanitizer.redact(ex.getMessage()));
            claimService.release(alert.getId());
            return false;
        }
    }
}
