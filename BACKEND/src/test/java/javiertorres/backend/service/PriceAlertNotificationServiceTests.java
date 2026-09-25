package javiertorres.backend.service;

import javiertorres.backend.entity.Car;
import javiertorres.backend.entity.PriceAlert;
import javiertorres.backend.event.CarPriceChangedEvent;
import javiertorres.backend.repository.PriceAlertRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PriceAlertNotificationServiceTests {

    @Mock
    private PriceAlertRepository priceAlertRepository;

    @Mock
    private PriceAlertClaimService claimService;

    @Mock
    private MailService mailService;

    @InjectMocks
    private PriceAlertNotificationService service;

    @Test
    void disabledMailReleasesTheClaimAndLeavesTheAlertPending() {
        UUID carId = UUID.randomUUID();
        UUID alertId = UUID.randomUUID();
        Car car = Car.builder().id(carId).prezzoVendita(new BigDecimal("80.00")).build();
        PriceAlert alert = PriceAlert.builder().id(alertId).car(car).build();
        CarPriceChangedEvent event =
                new CarPriceChangedEvent(carId, new BigDecimal("120.00"), new BigDecimal("80.00"));

        when(priceAlertRepository.findPendingTriggered(carId, event.prezzoPrecedente()))
                .thenReturn(List.of(alert));
        when(claimService.claim(alertId)).thenReturn(true);
        when(mailService.sendPriceDropNotification(alert, event.prezzoPrecedente())).thenReturn(false);

        service.notifySubscribers(event);

        verify(claimService).release(alertId);
    }

    @Test
    void deliveredMailKeepsTheClaim() {
        UUID carId = UUID.randomUUID();
        UUID alertId = UUID.randomUUID();
        Car car = Car.builder().id(carId).prezzoVendita(new BigDecimal("80.00")).build();
        PriceAlert alert = PriceAlert.builder().id(alertId).car(car).build();
        CarPriceChangedEvent event =
                new CarPriceChangedEvent(carId, new BigDecimal("120.00"), new BigDecimal("80.00"));

        when(priceAlertRepository.findPendingTriggered(carId, event.prezzoPrecedente()))
                .thenReturn(List.of(alert));
        when(claimService.claim(alertId)).thenReturn(true);
        when(mailService.sendPriceDropNotification(alert, event.prezzoPrecedente())).thenReturn(true);

        service.notifySubscribers(event);

        verify(claimService, never()).release(alertId);
    }
}
