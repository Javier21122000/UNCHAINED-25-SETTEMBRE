package javiertorres.backend.dto.auth;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.nio.charset.StandardCharsets;

public record LoginRequest(
        // Accetta sia lo username (max 50) sia l'email (max 254).
        @NotBlank @Size(max = 254) String username,
        @NotBlank @Size(max = 72) String password
) {
    public LoginRequest {
        username = username == null ? null : username.trim();
    }

    @AssertTrue(message = "la password non può superare i 72 byte")
    public boolean isPasswordWithinBcryptLimit() {
        return password == null || password.getBytes(StandardCharsets.UTF_8).length <= 72;
    }

    @Override
    public String toString() {
        return "LoginRequest[username=%s, password=***]".formatted(username);
    }
}
