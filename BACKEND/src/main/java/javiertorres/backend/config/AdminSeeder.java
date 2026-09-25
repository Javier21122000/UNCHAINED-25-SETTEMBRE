package javiertorres.backend.config;

import javiertorres.backend.entity.User;
import javiertorres.backend.entity.enums.Role;
import javiertorres.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Crea l'amministratore iniziale all'avvio, perché la registrazione pubblica assegna sempre USER
 * e nessuna API permette di promuovere un utente.
 * <p>
 * Idempotente: crea l'ADMIN se manca e riallinea quello esistente alle credenziali di
 * progettazione. In questo modo un valore casuale generato da un vecchio deploy Render non
 * lascia l'area amministrativa irraggiungibile.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@EnableConfigurationProperties(AdminProperties.class)
public class AdminSeeder implements ApplicationRunner {

    private final AdminProperties adminProperties;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!adminProperties.isConfigured()) {
            log.warn("ADMIN_PASSWORD non impostata: nessun amministratore iniziale creato");
            return;
        }
        var existingAdmin = userRepository.findByUsername(adminProperties.username())
                .filter(user -> user.getRole() == Role.ADMIN)
                .or(() -> userRepository.findByEmailIgnoreCase(adminProperties.email())
                        .filter(user -> user.getRole() == Role.ADMIN))
                .or(() -> userRepository.findFirstByRoleOrderByCreatedAtAsc(Role.ADMIN));

        if (existingAdmin.isPresent()) {
            syncExisting(existingAdmin.get());
            return;
        }
        if (userRepository.existsByUsername(adminProperties.username())
                || userRepository.existsByEmailIgnoreCase(adminProperties.email())) {
            log.warn("Username o email dell'admin già in uso da un utente non amministratore: seeding saltato");
            return;
        }

        User admin = userRepository.save(User.builder()
                .username(adminProperties.username())
                .email(adminProperties.email())
                // La password viene salvata solo come hash BCrypt e non viene mai loggata
                .password(passwordEncoder.encode(adminProperties.password()))
                .role(Role.ADMIN)
                .build());

        log.info("Amministratore iniziale creato: id={}", admin.getId());
    }

    private void syncExisting(User admin) {
        boolean changed = false;

        if (!admin.getUsername().equals(adminProperties.username())
                && userRepository.existsByUsername(adminProperties.username())) {
            log.warn("Username admin configurato già in uso: username esistente conservato");
        } else if (!admin.getUsername().equals(adminProperties.username())) {
            admin.setUsername(adminProperties.username());
            changed = true;
        }

        if (!admin.getEmail().equalsIgnoreCase(adminProperties.email())
                && userRepository.existsByEmailIgnoreCase(adminProperties.email())) {
            log.warn("Email admin configurata già in uso: email esistente conservata");
        } else if (!admin.getEmail().equals(adminProperties.email())) {
            admin.setEmail(adminProperties.email());
            changed = true;
        }

        if (!passwordEncoder.matches(adminProperties.password(), admin.getPassword())) {
            admin.setPassword(passwordEncoder.encode(adminProperties.password()));
            changed = true;
        }

        if (changed) {
            userRepository.saveAndFlush(admin);
            log.info("Credenziali amministratore riallineate: id={}", admin.getId());
        } else {
            log.debug("Credenziali amministratore già allineate");
        }
    }
}
