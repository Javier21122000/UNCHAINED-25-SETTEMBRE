package javiertorres.backend.event;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

/**
 * Pubblicato quando il prezzo di vendita di un'auto scende.
 * Trasporta solo valori immutabili (nessuna entità JPA): il listener gira dopo il commit,
 * su un altro thread, fuori dal persistence context che l'ha generato.
 */
public record CarPriceChangedEvent(
        UUID carId,
        BigDecimal prezzoPrecedente,
        BigDecimal nuovoPrezzo
) {
    public CarPriceChangedEvent {
        Objects.requireNonNull(carId, "carId");
        Objects.requireNonNull(prezzoPrecedente, "prezzoPrecedente");
        Objects.requireNonNull(nuovoPrezzo, "nuovoPrezzo");
    }
}
