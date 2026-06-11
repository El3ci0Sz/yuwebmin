package com.calvus.yuwebmin.utils;

/**
 * Classe utilitária para centralizar todas as mensagens de erro da aplicação.
 * Evita duplicação de texto e facilita a padronização
 */

public final class MensagensErro {

    private MensagensErro() {
    }

    // --- USUÁRIO ---
    public static final String USUARIO_NAO_ENCONTRADO_ID = "Usuário não encontrado com o ID: %d";
    public static final String CLIENTE_NAO_ENCONTRADO = "Cliente autenticado não foi encontrado no sistema.";
    public static final String EMAIL_DUPLICADO = "Já existe um usuário cadastrado com este e-mail.";

    // --- PRODUTO ---
    public static final String PRODUTO_NAO_ENCONTRADO_ID = "Produto com ID %d não existe no cardápio.";

    // --- PEDIDO ---
    public static final String CARRINHO_VAZIO = "Não é possível registrar um pedido sem itens.";
}
