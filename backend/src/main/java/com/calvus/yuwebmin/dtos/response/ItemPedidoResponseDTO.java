package com.calvus.yuwebmin.dtos.response;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class ItemPedidoResponseDTO {

    private Long produtoId;
    private String nomeProduto;
    private Integer quantidade;
    private BigDecimal precoUnitario;
}
