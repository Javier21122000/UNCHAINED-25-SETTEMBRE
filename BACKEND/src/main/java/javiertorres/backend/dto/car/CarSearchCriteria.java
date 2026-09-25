package javiertorres.backend.dto.car;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Filtri del catalogo (query string). I valori vengono usati solo come parametri
 * bindati tramite Criteria API, mai concatenati in SQL.
 */
public record CarSearchCriteria(
        @Size(max = 60) String marca,
        @Size(max = 80) String modello,
        @DecimalMin("0.00") BigDecimal prezzoMin,
        @DecimalMin("0.00") BigDecimal prezzoMax
) {
    public CarSearchCriteria {
        marca = marca == null || marca.isBlank() ? null : marca.trim();
        modello = modello == null || modello.isBlank() ? null : modello.trim();
    }

    @AssertTrue(message = "prezzoMin non può essere maggiore di prezzoMax")
    public boolean isPrezzoRangeValid() {
        return prezzoMin == null || prezzoMax == null || prezzoMin.compareTo(prezzoMax) <= 0;
    }
}
