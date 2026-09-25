package javiertorres.backend.service;

import javiertorres.backend.dto.auth.AuthResponse;
import javiertorres.backend.dto.auth.LoginRequest;
import javiertorres.backend.dto.auth.RegisterRequest;
import javiertorres.backend.dto.user.UserResponse;
import javiertorres.backend.entity.User;
import javiertorres.backend.entity.enums.Role;
import javiertorres.backend.exception.ConflictException;
import javiertorres.backend.repository.UserRepository;
import javiertorres.backend.security.JwtService;
import javiertorres.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    /** Il ruolo è sempre USER: non esiste alcun modo di sceglierlo dalla request. */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Username già in uso");
        }
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ConflictException("Email già registrata");
        }

        // In caso di race condition, i vincoli unique del DB generano un 409 dal GlobalExceptionHandler
        User user = userRepository.saveAndFlush(User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .build());

        return issueToken(UserPrincipal.withoutCredentials(user), UserResponse.from(user));
    }

    /** Credenziali errate → BadCredentialsException → 401 generico (stesso messaggio per utente inesistente). */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(request.username(), request.password()));

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.id()).orElseThrow();

        return issueToken(principal, UserResponse.from(user));
    }

    private AuthResponse issueToken(UserPrincipal principal, UserResponse user) {
        return AuthResponse.bearer(jwtService.generateToken(principal), jwtService.getExpirationSeconds(), user);
    }
}
