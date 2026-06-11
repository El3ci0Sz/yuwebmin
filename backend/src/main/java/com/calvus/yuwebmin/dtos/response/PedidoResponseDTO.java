package com.calvus.yuwebmin.dtos.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.calvus.yuwebmin.enums.StatusPedido;

import lombok.Data;

@Data
public class PedidoResponseDTO {

    private Long id;
    private String nomeCliente;
    private LocalDateTime dataPedido;
    private StatusPedido status;
    private BigDecimal valorTotal;
    private List<ItemPedidoResponseDTO> itens;

}
