package javiertorres.backend.config;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Credenziali dell'amministratore iniziale. La password arriva SOLO da ADMIN_PASSWORD:
 * non ha valore di ripiego e non compare in application.properties.
 *
 * @param password vuota → nessun admin viene creato (l'applicazione parte comunque)
 */
@Validated
@ConfigurationProperties(prefix = "app.admin")
public record AdminProperties(
        @NotBlank String username,
        @NotBlank @Email String email,
        String password
) {
    public boolean isConfigured() {
        return password != null && !password.isBlank();
    }
}
