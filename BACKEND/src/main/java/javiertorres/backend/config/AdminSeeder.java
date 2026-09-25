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
 * Idempotente: se esiste già un ADMIN non fa nulla, quindi i riavvii e i redeploy su Render
 * non sovrascrivono una password cambiata a mano.
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
        if (userRepository.countByRole(Role.ADMIN) > 0) {
            log.debug("Amministratore già presente: seeding saltato");
            return;
        }
        if (userRepository.existsByUsername(adminProperties.username())
                || userRepository.existsByEmail(adminProperties.email())) {
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
}
