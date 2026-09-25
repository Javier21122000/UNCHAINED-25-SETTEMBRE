package javiertorres.backend.dto.car;

import java.util.UUID;

/**
 * Vista di un'auto restituita dalle API. Il tipo concreto dipende dal ruolo del chiamante:
 * {@link CarResponse} per il pubblico (senza prezzo d'acquisto), {@link CarAdminResponse} per ADMIN.
 */
public sealed interface CarView permits CarResponse, CarAdminResponse {
    UUID id();
}
