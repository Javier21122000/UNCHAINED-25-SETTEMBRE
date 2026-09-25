package javiertorres.backend.repository;

import javiertorres.backend.entity.PriceAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PriceAlertRepository extends JpaRepository<PriceAlert, UUID> {

    @Query("""
            SELECT p FROM PriceAlert p
            JOIN FETCH p.car
            WHERE p.user.id = :userId
            ORDER BY p.createdAt DESC
            """)
    List<PriceAlert> findAllByUserIdWithCar(@Param("userId") UUID userId);

    @Query("""
            SELECT p FROM PriceAlert p
            JOIN FETCH p.car
            WHERE p.id = :id AND p.user.id = :userId
            """)
    Optional<PriceAlert> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    boolean existsByUserIdAndCarId(UUID userId, UUID carId);

    /**
     * Avvisi che hanno ATTRAVERSATO la soglia: prima il prezzo era sopra, ora è uguale o sotto.
     * <ul>
     *   <li>{@code sogliaPrezzo < :prezzoPrecedente} — prima era sopra. Un ribasso che parte da un
     *       prezzo già sotto soglia non è un attraversamento e non notifica nulla.</li>
     *   <li>{@code sogliaPrezzo >= c.prezzoVendita} — ora è uguale o sotto. Si legge il prezzo ATTUALE
     *       dal DB e non quello dell'evento: un evento async elaborato in ritardo, dopo un successivo
     *       rialzo, non genera una notifica ormai falsa.</li>
     * </ul>
     */
    @Query("""
            SELECT p FROM PriceAlert p
            JOIN FETCH p.user
            JOIN FETCH p.car c
            WHERE c.id = :carId
              AND c.isBozza = false
              AND p.inviato = false
              AND p.sogliaPrezzo < :prezzoPrecedente
              AND p.sogliaPrezzo >= c.prezzoVendita
            """)
    List<PriceAlert> findPendingTriggered(@Param("carId") UUID carId,
                                          @Param("prezzoPrecedente") BigDecimal prezzoPrecedente);

    /**
     * Claim atomico dell'invio: solo la transazione che ottiene 1 riga modificata invia la mail.
     * Protegge da invii multipli in caso di eventi concorrenti o retry.
     */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("UPDATE PriceAlert p SET p.inviato = true WHERE p.id = :id AND p.inviato = false")
    int markAsSent(@Param("id") UUID id);

    /** Compensazione: rilascia il claim se l'invio SMTP fallisce, così l'avviso resta attivo. */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("UPDATE PriceAlert p SET p.inviato = false WHERE p.id = :id AND p.inviato = true")
    int releaseSentClaim(@Param("id") UUID id);

    /** Ownership check atomico: 0 righe → 404. */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("DELETE FROM PriceAlert p WHERE p.id = :id AND p.user.id = :userId")
    int deleteByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("DELETE FROM PriceAlert p WHERE p.unsubscribeToken = :token")
    int deleteByUnsubscribeToken(@Param("token") UUID token);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("DELETE FROM PriceAlert p WHERE p.user.id = :userId")
    int deleteAllByUserId(@Param("userId") UUID userId);
}
