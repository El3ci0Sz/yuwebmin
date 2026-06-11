package com.calvus.yuwebmin.utils;

import java.net.URI;

import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * Utilitário para geração de URIs dinâmicas da API.
 */
public class UriUtils {

    private UriUtils() {
    }

    /**
     * Gera a URI (Location Header) para um novo recurso criado, baseado na
     * requisição atual.
     */
    public static URI criarUriDeRecurso(Long id) {
        return ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(id)
                .toUri();
    }

}
