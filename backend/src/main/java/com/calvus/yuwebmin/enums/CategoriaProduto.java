package com.calvus.yuwebmin.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Serializado em JSON com rótulos amigáveis (ex.: "Bebidas") para bater com o
 * contrato esperado pelo frontend.
 */
public enum CategoriaProduto {
    BEBIDA("Bebidas"),
    SOBREMESA("Sobremesas"),
    PORCAO_KILO("Porção Kilo"),
    DIVERSOS("Diversos");

    private final String rotulo;

    CategoriaProduto(String rotulo) {
        this.rotulo = rotulo;
    }

    @JsonValue
    public String toJson() {
        return rotulo;
    }

    @JsonCreator
    public static CategoriaProduto fromJson(String valor) {
        for (CategoriaProduto categoria : values()) {
            if (categoria.rotulo.equalsIgnoreCase(valor) || categoria.name().equalsIgnoreCase(valor)) {
                return categoria;
            }
        }
        throw new IllegalArgumentException("Categoria de produto inválida: " + valor);
    }
}
