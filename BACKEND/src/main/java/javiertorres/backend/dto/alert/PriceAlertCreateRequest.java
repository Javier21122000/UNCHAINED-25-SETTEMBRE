package javiertorres.backend.dto.alert;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

/** L'utente proprietario viene dedotto dal JWT, mai dal body. */
public record PriceAlertCreateRequest(
        @NotNull UUID carId,

        @NotNull
        @DecimalMin(value = "0.01")
        @Digits(integer = 10, fraction = 2)
        BigDecimal sogliaPrezzo
) {
}
