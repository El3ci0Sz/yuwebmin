package com.calvus.yuwebmin.dtos.request;

import com.calvus.yuwebmin.enums.StatusPedido;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AtualizarStatusPedidoDTO {
    @NotNull(message = "O novo status do pedido é obrigatorio")
    private StatusPedido novoStatus;
}
