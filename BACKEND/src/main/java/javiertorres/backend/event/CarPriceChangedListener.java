package javiertorres.backend.event;

import javiertorres.backend.config.AsyncConfig;
import javiertorres.backend.service.PriceAlertNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * AFTER_COMMIT: le mail partono solo se la modifica del prezzo è davvero persistita
 * (in caso di rollback nessuna notifica viene inviata).
 * @Async: l'invio SMTP avviene su un thread dedicato e non rallenta la risposta HTTP.
 * Le eccezioni non risalgono al chiamante, quindi vengono gestite e loggate qui.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CarPriceChangedListener {

    private final PriceAlertNotificationService notificationService;

    @Async(AsyncConfig.MAIL_EXECUTOR)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onCarPriceChanged(CarPriceChangedEvent event) {
        try {
            notificationService.notifySubscribers(event);
        } catch (RuntimeException ex) {
            log.error("Elaborazione notifiche fallita per auto id={}", event.carId(), ex);
        }
    }
}
