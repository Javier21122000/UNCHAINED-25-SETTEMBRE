package javiertorres.backend.repository;

import javiertorres.backend.entity.User;
import javiertorres.backend.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    long countByRole(Role role);
}
