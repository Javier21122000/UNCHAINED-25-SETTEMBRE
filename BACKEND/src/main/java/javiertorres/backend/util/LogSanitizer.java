package javiertorres.backend.util;

import java.util.regex.Pattern;

/**
 * I messaggi di PostgreSQL e di JavaMail possono contenere dati personali
 * (es. {@code Key (email)=(mario@example.com) already exists}). Prima di finire nei log
 * gli indirizzi vengono mascherati: resta l'informazione utile a diagnosticare, non il dato.
 */
public final class LogSanitizer {

    private static final Pattern EMAIL = Pattern.compile("[\\w.!#$%&'*+/=?^`{|}~-]+@[\\w-]+(?:\\.[\\w-]+)+");

    private LogSanitizer() {
    }

    public static String redact(String message) {
        return message == null ? null : EMAIL.matcher(message).replaceAll("[email rimossa]");
    }
}
