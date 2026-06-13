package com.calvus.yuwebmin.dtos.request;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ItemPedidoRequestDTO {

    private Long produtoId;
    private Long modeloMarmitaId;

    @NotNull(message = "A quantidade é obrigatória")
    @Positive(message = "A quantidade deve ser maior que zero")
    private Integer quantidade;

    private List<SubItemRequestDTO> subItens;

}
