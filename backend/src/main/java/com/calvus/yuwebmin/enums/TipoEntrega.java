package com.calvus.yuwebmin.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TipoEntrega {
    ENTREGA("Entrega"),
    RETIRADA("Retirada");

    private final String rotulo;

    TipoEntrega(String rotulo) {
        this.rotulo = rotulo;
    }

    @JsonValue
    public String toJson() {
        return rotulo;
    }

    @JsonCreator
    public static TipoEntrega fromJson(String valor) {
        for (TipoEntrega tipo : values()) {
            if (tipo.rotulo.equalsIgnoreCase(valor) || tipo.name().equalsIgnoreCase(valor)) {
                return tipo;
            }
        }
        throw new IllegalArgumentException("Tipo de entrega inválido: " + valor);
    }
}
