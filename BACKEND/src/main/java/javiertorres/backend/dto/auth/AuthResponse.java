package javiertorres.backend.dto.auth;

import javiertorres.backend.dto.user.UserResponse;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresInSeconds,
        UserResponse user
) {
    public static AuthResponse bearer(String accessToken, long expiresInSeconds, UserResponse user) {
        return new AuthResponse(accessToken, "Bearer", expiresInSeconds, user);
    }

    @Override
    public String toString() {
        return "AuthResponse[accessToken=***, tokenType=%s, expiresInSeconds=%d, user=%s]"
                .formatted(tokenType, expiresInSeconds, user);
    }
}
