package javiertorres.backend.dto.common;

import org.springframework.data.domain.Page;

import java.util.List;

/** Contratto JSON stabile per la paginazione (non serializza PageImpl direttamente). */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }
}
