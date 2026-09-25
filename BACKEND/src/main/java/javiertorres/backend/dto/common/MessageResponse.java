package javiertorres.backend.dto.common;

/** Risposta minimale per operazioni che non restituiscono una risorsa (es. unsubscribe). */
public record MessageResponse(String message) {
}
