package javiertorres.backend.repository.specification;

import javiertorres.backend.dto.car.CarSearchCriteria;
import javiertorres.backend.entity.Car;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Filtri del catalogo via Criteria API: ogni valore utente diventa un parametro bindato,
 * nessuna concatenazione di stringhe SQL/JPQL.
 */
public final class CarSpecifications {

    private static final char LIKE_ESCAPE = '\\';

    private CarSpecifications() {
    }

    public static Specification<Car> fromCriteria(CarSearchCriteria criteria, boolean includeDrafts) {
        List<Specification<Car>> specs = new ArrayList<>();

        if (!includeDrafts) {
            specs.add(published());
        }
        if (criteria.marca() != null) {
            specs.add(marcaEquals(criteria.marca()));
        }
        if (criteria.modello() != null) {
            specs.add(modelloContains(criteria.modello()));
        }
        if (criteria.prezzoMin() != null) {
            specs.add(prezzoVenditaAtLeast(criteria.prezzoMin()));
        }
        if (criteria.prezzoMax() != null) {
            specs.add(prezzoVenditaAtMost(criteria.prezzoMax()));
        }
        return Specification.allOf(specs);
    }

    private static Specification<Car> published() {
        return (root, query, cb) -> cb.isFalse(root.get("isBozza"));
    }

    private static Specification<Car> marcaEquals(String marca) {
        String value = marca.toLowerCase(Locale.ROOT);
        return (root, query, cb) -> cb.equal(cb.lower(root.get("marca")), value);
    }

    private static Specification<Car> modelloContains(String modello) {
        String pattern = "%" + escapeLike(modello.toLowerCase(Locale.ROOT)) + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("modello")), pattern, LIKE_ESCAPE);
    }

    private static Specification<Car> prezzoVenditaAtLeast(BigDecimal min) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("prezzoVendita"), min);
    }

    private static Specification<Car> prezzoVenditaAtMost(BigDecimal max) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("prezzoVendita"), max);
    }

    /** Impedisce che '%' e '_' inseriti dall'utente agiscano da wildcard. */
    private static String escapeLike(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
    }
}
