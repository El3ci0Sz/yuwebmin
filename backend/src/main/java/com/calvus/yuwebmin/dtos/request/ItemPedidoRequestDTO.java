package com.calvus.yuwebmin.dtos.request;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ItemPedidoRequestDTO {

    @NotNull(message = "O ID do produto é obrigatorio")
    private long produtoId;

    @NotNull(message = "A quantidade é obrigatória")
    @Positive(message = "A quantidade deve ser maior que zero")
    private Integer quantidade;

    // Lista opcional para o caso do produto ser uma Marmita Montável
    private List<SubItemRequestDTO> subItens;

}
