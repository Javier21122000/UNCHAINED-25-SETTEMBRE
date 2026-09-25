package javiertorres.backend.dto.favorite;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/** L'utente proprietario viene dedotto dal JWT, mai dal body. */
public record FavoriteCreateRequest(
        @NotNull UUID carId
) {
}
