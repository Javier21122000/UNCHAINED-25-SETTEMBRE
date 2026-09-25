package javiertorres.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "cars",
        indexes = {
                @Index(name = "idx_cars_is_bozza_prezzo_vendita", columnList = "is_bozza, prezzo_vendita"),
                @Index(name = "idx_cars_marca", columnList = "marca")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false, length = 60)
    private String marca;

    @Column(nullable = false, length = 80)
    private String modello;

    @Column(length = 4000)
    private String descrizione;

    @Column(name = "prezzo_acquisto", nullable = false, precision = 12, scale = 2)
    private BigDecimal prezzoAcquisto;

    @Column(name = "prezzo_vendita", nullable = false, precision = 12, scale = 2)
    private BigDecimal prezzoVendita;

    /** Secure by default: un'auto non è pubblica finché non viene esplicitamente pubblicata. */
    @Column(name = "is_bozza", nullable = false)
    @Builder.Default
    private Boolean isBozza = Boolean.TRUE;

    /** Optimistic locking: evita lost update su modifiche concorrenti del prezzo. */
    @Version
    @Column(nullable = false)
    private Long version;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Car other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
