package javiertorres.backend;

import com.jayway.jsonpath.JsonPath;
import javiertorres.backend.config.AdminProperties;
import javiertorres.backend.config.AdminSeeder;
import javiertorres.backend.entity.Car;
import javiertorres.backend.entity.User;
import javiertorres.backend.entity.enums.Role;
import javiertorres.backend.repository.CarRepository;
import javiertorres.backend.repository.FavoriteRepository;
import javiertorres.backend.repository.PriceAlertRepository;
import javiertorres.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiIntegrationTests {

    private static final String PASSWORD = "Password-di-test-123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private PriceAlertRepository priceAlertRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void cleanDatabase() {
        priceAlertRepository.deleteAll();
        favoriteRepository.deleteAll();
        carRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void registrationAlwaysCreatesAUserEvenWhenRoleIsInjected() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "mario",
                                  "email": "mario@example.com",
                                  "password": "%s",
                                  "role": "ADMIN"
                                }
                                """.formatted(PASSWORD)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.role").value("USER"));

        assertThat(userRepository.findByUsername("mario")).get()
                .extracting(User::getRole)
                .isEqualTo(Role.USER);
    }

    @Test
    void loginAcceptsTheDocumentedAdminEmail() throws Exception {
        userRepository.saveAndFlush(User.builder()
                .username("admin")
                .email("admin@autodealer.local")
                .password(passwordEncoder.encode(PASSWORD))
                .role(Role.ADMIN)
                .build());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"admin@autodealer.local","password":"%s"}
                                """.formatted(PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.username").value("admin"))
                .andExpect(jsonPath("$.user.role").value("ADMIN"))
                .andExpect(jsonPath("$.accessToken").isNotEmpty());
    }

    @Test
    void adminSeederRealignsAnExistingAdmin() throws Exception {
        User oldAdmin = userRepository.saveAndFlush(User.builder()
                .username("old-admin")
                .email("old-admin@example.com")
                .password(passwordEncoder.encode("vecchia-password"))
                .role(Role.ADMIN)
                .build());

        AdminProperties properties =
                new AdminProperties("admin", "admin@autodealer.local", PASSWORD);
        new AdminSeeder(properties, userRepository, passwordEncoder).run(null);

        User updated = userRepository.findById(oldAdmin.getId()).orElseThrow();
        assertThat(updated.getUsername()).isEqualTo("admin");
        assertThat(updated.getEmail()).isEqualTo("admin@autodealer.local");
        assertThat(passwordEncoder.matches(PASSWORD, updated.getPassword())).isTrue();
    }

    @Test
    void publicCatalogHidesDraftsAndPurchasePrice() throws Exception {
        carRepository.saveAndFlush(car("Pubblicata", false));
        carRepository.saveAndFlush(car("Segreta", true));

        mockMvc.perform(get("/api/cars").param("size", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].modello").value("Pubblicata"))
                .andExpect(jsonPath("$.content[0].prezzoAcquisto").doesNotExist())
                .andExpect(jsonPath("$.content[0].isBozza").doesNotExist());
    }

    @Test
    void ordinaryUserCannotWriteTheCatalog() throws Exception {
        String token = registerAndToken("utente", "utente@example.com");

        mockMvc.perform(post("/api/cars")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "marca":"Ford",
                                  "modello":"Test",
                                  "descrizione":null,
                                  "prezzoAcquisto":100,
                                  "prezzoVendita":200,
                                  "isBozza":false
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void favoriteAndAlertOfAnotherUserReturnNotFound() throws Exception {
        String ownerToken = registerAndToken("owner", "owner@example.com");
        String strangerToken = registerAndToken("stranger", "stranger@example.com");
        Car car = carRepository.saveAndFlush(car("Condivisa", false));

        String favoriteBody = mockMvc.perform(post("/api/favorites")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"carId\":\"%s\"}".formatted(car.getId())))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String favoriteId = JsonPath.read(favoriteBody, "$.id");

        String alertBody = mockMvc.perform(post("/api/alerts")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"carId\":\"%s\",\"sogliaPrezzo\":150}".formatted(car.getId())))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String alertId = JsonPath.read(alertBody, "$.id");

        mockMvc.perform(delete("/api/favorites/{id}", UUID.fromString(favoriteId))
                        .header("Authorization", "Bearer " + strangerToken))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/api/alerts/{id}", UUID.fromString(alertId))
                        .header("Authorization", "Bearer " + strangerToken))
                .andExpect(status().isNotFound());

        assertThat(favoriteRepository.existsById(UUID.fromString(favoriteId))).isTrue();
        assertThat(priceAlertRepository.existsById(UUID.fromString(alertId))).isTrue();
    }

    private String registerAndToken(String username, String email) throws Exception {
        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"%s","email":"%s","password":"%s"}
                                """.formatted(username, email, PASSWORD)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.accessToken");
    }

    private static Car car(String modello, boolean draft) {
        return Car.builder()
                .marca("Marca")
                .modello(modello)
                .descrizione("Descrizione")
                .prezzoAcquisto(new BigDecimal("100.00"))
                .prezzoVendita(new BigDecimal("200.00"))
                .isBozza(draft)
                .build();
    }
}
