package com.calvus.yuwebmin.dtos.response;

import java.math.BigDecimal;
import java.util.List;

import lombok.Data;

@Data
public class ItemPedidoResponseDTO {

    private Integer quantidade;
    private BigDecimal precoUnitario;

    private List<SubItemResponseDTO> subItens;
    private ProdutoResponseDTO produto;
    // Marmita
    private ModeloMarmitaResponseDTO modeloMarmita;

}
