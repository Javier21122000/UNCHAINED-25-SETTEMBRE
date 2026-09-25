package javiertorres.backend.dto.favorite;

import javiertorres.backend.dto.car.CarResponse;
import javiertorres.backend.entity.Favorite;

import java.time.Instant;
import java.util.UUID;

public record FavoriteResponse(
        UUID id,
        CarResponse car,
        Instant createdAt
) {
    public static FavoriteResponse from(Favorite favorite) {
        return new FavoriteResponse(
                favorite.getId(),
                CarResponse.from(favorite.getCar()),
                favorite.getCreatedAt()
        );
    }
}
