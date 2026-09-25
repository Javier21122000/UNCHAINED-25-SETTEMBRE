package javiertorres.backend.controller;

import javiertorres.backend.dto.user.UserResponse;
import javiertorres.backend.security.UserPrincipal;
import javiertorres.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Solo "me": non esistono rotte per leggere o modificare altri utenti. */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal UserPrincipal caller) {
        return userService.getCurrent(caller);
    }

    /** Elimina anche preferiti e avvisi dell'utente. */
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMe(@AuthenticationPrincipal UserPrincipal caller) {
        userService.deleteCurrent(caller);
        return ResponseEntity.noContent().build();
    }
}
