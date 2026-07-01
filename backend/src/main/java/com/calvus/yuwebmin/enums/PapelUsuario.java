package com.calvus.yuwebmin.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Enumeração para os Papéis (Roles) de Acesso do Usuário.
 * Representa os níveis de autoridade que um usuário pode possuir no sistema
 * (ADMIN ou CLIENTE).
 * No sistema, é utilizado pelo Spring Security para bloquear ou liberar o
 * acesso a rotas específicas.
 * Serializado em JSON como "admin"/"cliente" (minúsculo) para bater com o
 * contrato esperado pelo frontend.
 */

public enum PapelUsuario {
    CLIENTE,
    ADMIN;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static PapelUsuario fromJson(String valor) {
        return PapelUsuario.valueOf(valor.trim().toUpperCase());
    }
}
