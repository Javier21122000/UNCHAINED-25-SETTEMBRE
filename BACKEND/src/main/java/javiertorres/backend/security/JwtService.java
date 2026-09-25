package javiertorres.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class JwtService {

    private static final long CLOCK_SKEW_SECONDS = 30;

    private final JwtProperties properties;
    private final SecretKey signingKey;
    private final JwtParser parser;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        // Lancia WeakKeyException all'avvio se la chiave è < 256 bit: fail fast.
        this.signingKey = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
        this.parser = Jwts.parser()
                .verifyWith(signingKey)
                .requireIssuer(properties.issuer())
                .clockSkewSeconds(CLOCK_SKEW_SECONDS)
                .build();
    }

    /** Il subject è l'UUID dell'utente; il ruolo NON viene letto dal token ma ricaricato dal DB. */
    public String generateToken(UserPrincipal principal) {
        Instant now = Instant.now();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .issuer(properties.issuer())
                .subject(principal.id().toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(properties.expiration())))
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    /** Ritorna l'id utente se il token è valido (firma, issuer, scadenza), altrimenti empty. */
    public Optional<UUID> extractUserId(String token) {
        try {
            Claims claims = parser.parseSignedClaims(token).getPayload();
            return Optional.of(UUID.fromString(claims.getSubject()));
        } catch (JwtException | IllegalArgumentException ex) {
            log.debug("JWT rifiutato: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    public long getExpirationSeconds() {
        return properties.expiration().toSeconds();
    }
}
