package javiertorres.backend.dto.car;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/** Semantica PUT: sostituzione completa della risorsa. */
public record CarUpdateRequest(
        @NotBlank @Size(max = 60) String marca,
        @NotBlank @Size(max = 80) String modello,
        @Size(max = 4000) String descrizione,

        @NotNull
        @DecimalMin(value = "0.00")
        @Digits(integer = 10, fraction = 2)
        BigDecimal prezzoAcquisto,

        @NotNull
        @DecimalMin(value = "0.01")
        @Digits(integer = 10, fraction = 2)
        BigDecimal prezzoVendita,

        @NotNull Boolean isBozza
) {
    public CarUpdateRequest {
        marca = marca == null ? null : marca.trim();
        modello = modello == null ? null : modello.trim();
        descrizione = descrizione == null || descrizione.isBlank() ? null : descrizione.trim();
    }
}
