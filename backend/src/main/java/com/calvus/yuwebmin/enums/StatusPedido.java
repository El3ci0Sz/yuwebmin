package com.calvus.yuwebmin.enums;

/**
 * Enumeração para os Status do Pedido.
 * Representa os estados possíveis pelos quais uma compra passa no ciclo de vida
 * do restaurante.
 */

public enum StatusPedido {
    RECEBIDO,
    PREPARANDO,
    SAIU_PARA_ENTREGA,
    CONCLUIDO,
    CANCELADO
}
