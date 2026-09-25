package javiertorres.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "price_alerts",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_price_alerts_user_car", columnNames = {"user_id", "car_id"}),
                @UniqueConstraint(name = "uk_price_alerts_unsubscribe_token", columnNames = "unsubscribe_token")
        },
        indexes = @Index(name = "idx_price_alerts_car_inviato", columnList = "car_id, inviato")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, updatable = false,
            foreignKey = @ForeignKey(name = "fk_price_alerts_user"))
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "car_id", nullable = false, updatable = false,
            foreignKey = @ForeignKey(name = "fk_price_alerts_car"))
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Car car;

    @Column(name = "soglia_prezzo", nullable = false, precision = 12, scale = 2)
    private BigDecimal sogliaPrezzo;

    @Column(nullable = false)
    @Builder.Default
    private Boolean inviato = Boolean.FALSE;

    @Column(name = "unsubscribe_token", nullable = false, updatable = false)
    private UUID unsubscribeToken;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onPrePersist() {
        if (unsubscribeToken == null) {
            unsubscribeToken = UUID.randomUUID();
        }
        if (inviato == null) {
            inviato = Boolean.FALSE;
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PriceAlert other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
