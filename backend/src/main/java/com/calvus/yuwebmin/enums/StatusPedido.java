package com.calvus.yuwebmin.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Enumeração para os Status do Pedido.
 * Representa os estados possíveis pelos quais uma compra passa no ciclo de vida
 * do restaurante.
 * Serializado em JSON com rótulos amigáveis (ex.: "Em entrega") para bater com
 * o contrato esperado pelo frontend.
 */

public enum StatusPedido {
    RECEBIDO("Aceito"),
    PREPARANDO("Preparando"),
    SAIU_PARA_ENTREGA("Em entrega"),
    CONCLUIDO("Concluído"),
    CANCELADO("Negado");

    private final String rotulo;

    StatusPedido(String rotulo) {
        this.rotulo = rotulo;
    }

    @JsonValue
    public String toJson() {
        return rotulo;
    }

    @JsonCreator
    public static StatusPedido fromJson(String valor) {
        for (StatusPedido status : values()) {
            if (status.rotulo.equalsIgnoreCase(valor) || status.name().equalsIgnoreCase(valor)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Status de pedido inválido: " + valor);
    }
}
