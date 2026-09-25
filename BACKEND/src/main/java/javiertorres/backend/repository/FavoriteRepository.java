package javiertorres.backend.repository;

import javiertorres.backend.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FavoriteRepository extends JpaRepository<Favorite, UUID> {

    /** Le auto tornate in bozza vengono nascoste per non rivelarne i dati. */
    @Query("""
            SELECT f FROM Favorite f
            JOIN FETCH f.car c
            WHERE f.user.id = :userId AND c.isBozza = false
            ORDER BY f.createdAt DESC
            """)
    List<Favorite> findAllVisibleByUserId(@Param("userId") UUID userId);

    @Query("""
            SELECT f FROM Favorite f
            JOIN FETCH f.car
            WHERE f.id = :id AND f.user.id = :userId
            """)
    Optional<Favorite> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    boolean existsByUserIdAndCarId(UUID userId, UUID carId);

    /** Ownership check atomico: 0 righe → 404, sia se non esiste sia se appartiene a un altro utente. */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("DELETE FROM Favorite f WHERE f.id = :id AND f.user.id = :userId")
    int deleteByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("DELETE FROM Favorite f WHERE f.user.id = :userId")
    int deleteAllByUserId(@Param("userId") UUID userId);
}
