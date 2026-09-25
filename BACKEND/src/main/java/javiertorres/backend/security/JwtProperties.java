package javiertorres.backend.security;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

/**
 * @param secret     chiave HMAC, almeno 256 bit (32 byte) per HS256
 * @param expiration durata del token (un numero senza unità è interpretato in millisecondi)
 * @param issuer     valore del claim "iss", verificato in fase di parsing
 */
@Validated
@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(
        @NotBlank @Size(min = 32) String secret,
        @NotNull Duration expiration,
        @NotBlank String issuer
) {
}
