package com.calvus.yuwebmin.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.calvus.yuwebmin.dtos.response.ItemPedidoResponseDTO;
import com.calvus.yuwebmin.models.ItemPedido;

/**
 * Mapper para os Itens do Pedido.
 * Responsável por converter a entidade interna ItemPedido para o DTO de
 * resposta que será enviado ao frontend.
 */

@Mapper(componentModel = "spring")
public interface ItemPedidoMapper {

    /**
     * Converte a entidade ItemPedido para ItemPedidoResponseDTO.
     * 
     * @param item A entidade que veio do banco de dados.
     * @return O DTO pronto para o frontend.
     */
    @Mapping(target = "produtoId", source = "produto.id")
    @Mapping(target = "nomeProduto", source = "produto.nome")
    ItemPedidoResponseDTO toResponseDTO(ItemPedido item);
}