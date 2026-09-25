package javiertorres.backend.security;

import javiertorres.backend.entity.User;
import javiertorres.backend.entity.enums.Role;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Principal immutabile nel SecurityContext. I controller lo ricevono con
 * {@code @AuthenticationPrincipal}: è l'unica fonte dell'identità dell'utente.
 */
public record UserPrincipal(
        UUID id,
        String username,
        String password,
        Role role
) implements UserDetails {

    /** Per il login: include l'hash BCrypt da verificare. */
    public static UserPrincipal withCredentials(User user) {
        return new UserPrincipal(user.getId(), user.getUsername(), user.getPassword(), user.getRole());
    }

    /** Per le richieste autenticate via JWT: nessuna credenziale in memoria. */
    public static UserPrincipal withoutCredentials(User user) {
        return new UserPrincipal(user.getId(), user.getUsername(), null, user.getRole());
    }

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public String toString() {
        return "UserPrincipal[id=%s, username=%s, role=%s]".formatted(id, username, role);
    }
}
