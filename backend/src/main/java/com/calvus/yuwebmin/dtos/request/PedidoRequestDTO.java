package com.calvus.yuwebmin.dtos.request;

import java.math.BigDecimal;
import java.util.List;

import com.calvus.yuwebmin.enums.MetodoPagamento;
import com.calvus.yuwebmin.enums.TipoEntrega;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PedidoRequestDTO {

    @NotEmpty(message = "O pedido não pode ser vazido")
    @Valid
    private List<ItemPedidoRequestDTO> itens;

    @NotNull(message = "O tipo de entrega é obrigatório (DELIVERY ou RETIRADA).")
    private TipoEntrega tipoEntrega;

    @NotNull(message = "O método de pagamento é obrigatório.")
    private MetodoPagamento metodoPagamento;

    // Opcionais (dependem das escolhas acima)
    private Long enderecoEntregaId;
    private BigDecimal valorTroco;

}
