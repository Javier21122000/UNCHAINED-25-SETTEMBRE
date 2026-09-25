package javiertorres.backend.config;

import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Render pubblica la connessione al database come {@code DATABASE_URL} nel formato
 * {@code postgres://utente:password@host:porta/nomedb}, che il driver JDBC non accetta.
 * Questa classe la traduce in {@code jdbc:postgresql://host:porta/nomedb} più username e password
 * separati, prima che Spring costruisca il DataSource.
 * <p>
 * Gira come {@link EnvironmentPostProcessor} (registrato in {@code META-INF/spring.factories}):
 * è l'unico momento in cui si può intervenire prima dell'auto-configurazione del DataSource.
 * Senza {@code DATABASE_URL}, o con un valore già in formato JDBC, non tocca niente e
 * restano validi i valori di application.properties.
 */
public class DatabaseUrl implements EnvironmentPostProcessor {

    private static final String PROPERTY_SOURCE_NAME = "renderDatabaseUrl";
    private static final String DEFAULT_PORT = "5432";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String raw = environment.getProperty("DATABASE_URL");

        if (raw == null || raw.isBlank() || raw.startsWith("jdbc:")) {
            return;
        }

        Map<String, Object> properties = parse(raw);
        if (properties.isEmpty()) {
            return;
        }

        // addFirst: questi valori vincono su application.properties, che resta il ripiego per il locale
        environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE_NAME, properties));
    }

    /** @return le proprietà del datasource, oppure una mappa vuota se l'URL non è interpretabile */
    private static Map<String, Object> parse(String raw) {
        URI uri;
        try {
            uri = new URI(raw.trim());
        } catch (URISyntaxException ex) {
            // Nessun log: l'URL contiene la password. Si prosegue con la configurazione di default.
            return Map.of();
        }

        String host = uri.getHost();
        String database = uri.getPath() == null ? "" : uri.getPath().replaceFirst("^/", "");
        if (host == null || database.isEmpty()) {
            return Map.of();
        }

        String port = uri.getPort() == -1 ? DEFAULT_PORT : String.valueOf(uri.getPort());
        StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://%s:%s/%s".formatted(host, port, database));
        if (uri.getQuery() != null && !uri.getQuery().isBlank()) {
            jdbcUrl.append('?').append(uri.getQuery());
        }

        Map<String, Object> properties = new HashMap<>();
        properties.put("spring.datasource.url", jdbcUrl.toString());

        // userInfo è percent-encoded nell'URL: password con caratteri speciali vanno decodificate
        String userInfo = uri.getUserInfo();
        if (userInfo != null && !userInfo.isBlank()) {
            int separator = userInfo.indexOf(':');
            if (separator < 0) {
                properties.put("spring.datasource.username", decode(userInfo));
            } else {
                properties.put("spring.datasource.username", decode(userInfo.substring(0, separator)));
                properties.put("spring.datasource.password", decode(userInfo.substring(separator + 1)));
            }
        }
        return properties;
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
