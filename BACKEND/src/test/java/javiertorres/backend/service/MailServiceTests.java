package javiertorres.backend.service;

import javiertorres.backend.config.MailProperties;
import javiertorres.backend.entity.Car;
import javiertorres.backend.entity.PriceAlert;
import javiertorres.backend.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

class MailServiceTests {

    @Test
    void disabledProviderDoesNotReportTheNotificationAsDelivered() {
        JavaMailSender sender = mock(JavaMailSender.class);
        MailProperties properties = new MailProperties(
                "noreply@example.com", "http://localhost:8080", false, "smtp", "");
        MailService service = new MailService(sender, properties);

        User user = User.builder().username("mario").email("mario@example.com").build();
        Car car = Car.builder()
                .marca("Ford")
                .modello("Test")
                .prezzoVendita(new BigDecimal("80.00"))
                .build();
        PriceAlert alert = PriceAlert.builder()
                .id(UUID.randomUUID())
                .user(user)
                .car(car)
                .sogliaPrezzo(new BigDecimal("100.00"))
                .unsubscribeToken(UUID.randomUUID())
                .build();

        boolean delivered = service.sendPriceDropNotification(alert, new BigDecimal("120.00"));

        assertThat(delivered).isFalse();
        verifyNoInteractions(sender);
    }
}
