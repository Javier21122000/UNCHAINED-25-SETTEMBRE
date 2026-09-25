package javiertorres.backend.dto.car;

import javiertorres.backend.entity.Car;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CarAdminResponse(
        UUID id,
        String marca,
        String modello,
        String descrizione,
        BigDecimal prezzoAcquisto,
        BigDecimal prezzoVendita,
        Boolean isBozza,
        Instant createdAt,
        Instant updatedAt
) implements CarView {

    public static CarAdminResponse from(Car car) {
        return new CarAdminResponse(
                car.getId(),
                car.getMarca(),
                car.getModello(),
                car.getDescrizione(),
                car.getPrezzoAcquisto(),
                car.getPrezzoVendita(),
                car.getIsBozza(),
                car.getCreatedAt(),
                car.getUpdatedAt()
        );
    }
}
