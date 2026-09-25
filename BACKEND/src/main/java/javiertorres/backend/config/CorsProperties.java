package javiertorres.backend.config;

import jakarta.validation.constraints.NotEmpty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.List;

/** Popolato da CORS_ALLOWED_ORIGINS (lista separata da virgole). */
@Validated
@ConfigurationProperties(prefix = "app.cors")
public record CorsProperties(
        @NotEmpty List<String> allowedOrigins
) {
}
