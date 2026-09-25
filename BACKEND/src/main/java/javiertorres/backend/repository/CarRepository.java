package javiertorres.backend.repository;

import javiertorres.backend.entity.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface CarRepository extends JpaRepository<Car, UUID>, JpaSpecificationExecutor<Car> {

    /** Lookup per utenti non ADMIN: le bozze risultano inesistenti (404). */
    Optional<Car> findByIdAndIsBozzaFalse(UUID id);
}
