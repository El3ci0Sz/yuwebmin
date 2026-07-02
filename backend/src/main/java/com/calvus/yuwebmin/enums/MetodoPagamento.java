package com.calvus.yuwebmin.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Serializado em JSON com rótulos amigáveis (ex.: "Pix") para bater com o
 * contrato esperado pelo frontend.
 */
public enum MetodoPagamento {
    PIX("Pix"),
    CARTAO_CREDITO("Crédito"),
    CARTAO_DEBITO("Débito"),
    DINHEIRO("Dinheiro"),
    CARTAO_FIDELIDADE("Cartão Fidelidade");

    private final String rotulo;

    MetodoPagamento(String rotulo) {
        this.rotulo = rotulo;
    }

    @JsonValue
    public String toJson() {
        return rotulo;
    }

    @JsonCreator
    public static MetodoPagamento fromJson(String valor) {
        for (MetodoPagamento metodo : values()) {
            if (metodo.rotulo.equalsIgnoreCase(valor) || metodo.name().equalsIgnoreCase(valor)) {
                return metodo;
            }
        }
        throw new IllegalArgumentException("Método de pagamento inválido: " + valor);
    }
}
