package javiertorres.backend.dto.car;

import javiertorres.backend.entity.Car;

import java.math.BigDecimal;
import java.util.UUID;

/** Vista pubblica: non espone mai prezzoAcquisto né lo stato di bozza. */
public record CarResponse(
        UUID id,
        String marca,
        String modello,
        String descrizione,
        BigDecimal prezzoVendita
) implements CarView {

    public static CarResponse from(Car car) {
        return new CarResponse(
                car.getId(),
                car.getMarca(),
                car.getModello(),
                car.getDescrizione(),
                car.getPrezzoVendita()
        );
    }
}
