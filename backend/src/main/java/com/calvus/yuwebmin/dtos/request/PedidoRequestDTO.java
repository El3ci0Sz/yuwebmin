package com.calvus.yuwebmin.dtos.request;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class PedidoRequestDTO {

    @NotEmpty(message = "O pedido não pode ser vazido")
    @Valid
    private List<ItemPedidoRequestDTO> itens;

}
