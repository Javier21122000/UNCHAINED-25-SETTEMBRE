package javiertorres.backend.dto.alert;

import javiertorres.backend.entity.Car;
import javiertorres.backend.entity.PriceAlert;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Non espone l'unsubscribeToken: viaggia solo nella mail. */
public record PriceAlertResponse(
        UUID id,
        UUID carId,
        String marca,
        String modello,
        BigDecimal prezzoVenditaAttuale,
        BigDecimal sogliaPrezzo,
        Boolean inviato,
        Instant createdAt
) {
    public static PriceAlertResponse from(PriceAlert alert) {
        Car car = alert.getCar();
        return new PriceAlertResponse(
                alert.getId(),
                car.getId(),
                car.getMarca(),
                car.getModello(),
                car.getPrezzoVendita(),
                alert.getSogliaPrezzo(),
                alert.getInviato(),
                alert.getCreatedAt()
        );
    }
}
