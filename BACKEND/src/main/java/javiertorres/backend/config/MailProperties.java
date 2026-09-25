package javiertorres.backend.config;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * @param from    mittente delle notifiche
 * @param baseUrl URL pubblico del backend, usato per costruire il link di disiscrizione
 * @param enabled false in dev/test: le mail vengono solo loggate, nessuna connessione SMTP
 */
@Validated
@ConfigurationProperties(prefix = "app.mail")
public record MailProperties(
        @NotBlank @Email String from,
        @NotBlank String baseUrl,
        boolean enabled,
        @NotBlank @Pattern(regexp = "smtp|resend") String provider,
        String apiKey
) {
    public MailProperties {
        baseUrl = baseUrl == null ? null : baseUrl.replaceAll("/+$", "");
    }

    public String unsubscribeUrl(java.util.UUID token) {
        return "%s/api/alerts/unsubscribe/%s".formatted(baseUrl, token);
    }

    public boolean usesResend() {
        return "resend".equals(provider);
    }

    public boolean hasApiKey() {
        return apiKey != null && !apiKey.isBlank();
    }
}
