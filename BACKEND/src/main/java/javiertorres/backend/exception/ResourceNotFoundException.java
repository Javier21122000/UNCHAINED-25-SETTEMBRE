package javiertorres.backend.exception;

/** 404. Usata anche per risorse di altri utenti, per non rivelarne l'esistenza. */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
