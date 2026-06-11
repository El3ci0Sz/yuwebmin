package com.calvus.yuwebmin.enums;

/**
 * Enumeração para os Papéis (Roles) de Acesso do Usuário.
 * Representa os níveis de autoridade que um usuário pode possuir no sistema
 * (ADMIN ou CLIENTE).
 * No sistema, é utilizado pelo Spring Security para bloquear ou liberar o
 * acesso a rotas específicas.
 */

public enum PapelUsuario {
    CLIENTE,
    ADMIN
}
