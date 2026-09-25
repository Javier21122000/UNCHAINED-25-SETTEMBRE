package javiertorres.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

/**
 * Nessun campo "role" o "userId": il ruolo è sempre assegnato dal server (USER).
 * Eventuali campi extra nel JSON vengono ignorati.
 */
public record RegisterRequest(
        @NotBlank
        @Size(min = 3, max = 50)
        @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "può contenere solo lettere, numeri, '.', '_' e '-'")
        String username,

        @NotBlank
        @Email
        @Size(max = 254)
        String email,

        // BCrypt ignora i byte oltre il 72°
        @NotBlank
        @Size(min = 8, max = 72)
        String password
) {
    public RegisterRequest {
        username = username == null ? null : username.trim();
        email = email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    @AssertTrue(message = "la password non può superare i 72 byte")
    public boolean isPasswordWithinBcryptLimit() {
        return password == null || password.getBytes(StandardCharsets.UTF_8).length <= 72;
    }

    @Override
    public String toString() {
        return "RegisterRequest[username=%s, email=%s, password=***]".formatted(username, email);
    }
}
