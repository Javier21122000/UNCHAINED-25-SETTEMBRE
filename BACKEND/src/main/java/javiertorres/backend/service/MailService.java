package javiertorres.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import javiertorres.backend.config.MailProperties;
import javiertorres.backend.entity.Car;
import javiertorres.backend.entity.PriceAlert;
import javiertorres.backend.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.MailPreparationException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.HtmlUtils;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/** Composizione e invio via SMTP o API HTTPS. Non conosce transazioni né stato applicativo. */
@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;
    private final MailProperties mailProperties;

    private final RestClient resendClient = RestClient.create("https://api.resend.com");

    /**
     * Mail multipart: versione testo e versione HTML. Nel template HTML <b>ogni</b> valore che
     * proviene dal database passa da {@link HtmlUtils#htmlEscape}, perché username e descrizione
     * sono testo scelto dall'utente: un marca/modello con {@code <script>} resta testo visibile,
     * non diventa markup nel client di posta.
     *
     * @throws MailException se l'invio fallisce: il chiamante rilascia il claim così
     *                       l'avviso resta attivo e potrà essere notificato in futuro
     * @return {@code true} quando il provider accetta la consegna; {@code false} se l'invio
     *         è disabilitato
     */
    public boolean sendPriceDropNotification(PriceAlert alert, BigDecimal prezzoPrecedente) {
        User user = alert.getUser();
        Car car = alert.getCar();

        String auto = "%s %s".formatted(car.getMarca(), car.getModello());
        String subject = "Prezzo ribassato: " + auto;
        String unsubscribeUrl = mailProperties.unsubscribeUrl(alert.getUnsubscribeToken());

        String plainText = """
                Ciao %s,

                il prezzo di %s è sceso da %s € a %s €,
                sotto la soglia di %s € che avevi impostato.

                Per non ricevere più avvisi su questa auto:
                %s

                Unchained
                """.formatted(
                user.getUsername(),
                auto,
                prezzoPrecedente.toPlainString(),
                car.getPrezzoVendita().toPlainString(),
                alert.getSogliaPrezzo().toPlainString(),
                unsubscribeUrl);

        String html = """
                <!DOCTYPE html>
                <html lang="it">
                <body style="font-family:Arial,Helvetica,sans-serif;color:#222;">
                  <p>Ciao <strong>%s</strong>,</p>
                  <p>il prezzo di <strong>%s</strong> è sceso da %s&nbsp;€ a
                     <strong>%s&nbsp;€</strong>, sotto la soglia di %s&nbsp;€ che avevi impostato.</p>
                  <p><a href="%s">Non voglio più avvisi su questa auto</a></p>
                  <p style="color:#777;font-size:12px;">Unchained</p>
                </body>
                </html>
                """.formatted(
                HtmlUtils.htmlEscape(user.getUsername()),
                HtmlUtils.htmlEscape(auto),
                HtmlUtils.htmlEscape(prezzoPrecedente.toPlainString()),
                HtmlUtils.htmlEscape(car.getPrezzoVendita().toPlainString()),
                HtmlUtils.htmlEscape(alert.getSogliaPrezzo().toPlainString()),
                // Token UUID generato dal server, non un valore utente: resta un URL valido
                HtmlUtils.htmlEscape(unsubscribeUrl));

        if (!mailProperties.enabled()) {
            // Il chiamante rilascera' il claim: un avviso mai spedito non deve risultare "inviato".
            log.warn("Invio mail disabilitato, notifica lasciata in attesa per avviso id={}", alert.getId());
            return false;
        }

        if (mailProperties.usesResend()) {
            sendWithResend(user.getEmail(), subject, plainText, html);
            log.info("Notifica di ribasso inviata via API HTTPS per avviso id={}", alert.getId());
            return true;
        }

        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(mailProperties.from());
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            // true = il secondo argomento è l'alternativa HTML
            helper.setText(plainText, html);
        } catch (MessagingException ex) {
            throw new MailPreparationException("Composizione della notifica fallita", ex);
        }

        mailSender.send(message);
        log.info("Notifica di ribasso inviata per avviso id={}", alert.getId());
        return true;
    }

    private void sendWithResend(String recipient, String subject, String plainText, String html) {
        if (!mailProperties.hasApiKey()) {
            throw new MailSendException("MAIL_API_KEY mancante per il provider Resend");
        }

        try {
            resendClient.post()
                    .uri("/emails")
                    .header("Authorization", "Bearer " + mailProperties.apiKey())
                    .body(Map.of(
                            "from", mailProperties.from(),
                            "to", new String[]{recipient},
                            "subject", subject,
                            "text", plainText,
                            "html", html))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException ex) {
            throw new MailSendException("Invio via API HTTPS fallito", ex);
        }
    }
}
