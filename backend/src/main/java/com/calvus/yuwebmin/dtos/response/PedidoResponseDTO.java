package com.calvus.yuwebmin.dtos.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.calvus.yuwebmin.enums.MetodoPagamento;
import com.calvus.yuwebmin.enums.StatusPedido;
import com.calvus.yuwebmin.enums.TipoEntrega;

import lombok.Data;

@Data
public class PedidoResponseDTO {

    private Long id;
    private LocalDateTime dataPedido;
    private String status;
    private BigDecimal valorTotal;
    private String tipoEntrega;
    private String metodoPagamento;
    // Dados do Cliente e Entrega
    private String nomeCliente;
    private EnderecoResponseDTO enderecoEntrega; // Rua, número, bairro, etc.

    // A lista de linhas do pedido
    private List<ItemPedidoResponseDTO> itens;
}
