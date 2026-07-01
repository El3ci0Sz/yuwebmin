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

    // Opcional: se omitido, o backend infere ENTREGA (quando enderecoEntregaId é
    // informado) ou RETIRADA (caso contrário). O frontend atual não expõe essa
    // escolha na tela de pedido.
    private TipoEntrega tipoEntrega;

    @NotNull(message = "O método de pagamento é obrigatório.")
    private MetodoPagamento metodoPagamento;

    // Opcionais (dependem das escolhas acima)
    private Long enderecoEntregaId;
    private BigDecimal valorTroco;

}
