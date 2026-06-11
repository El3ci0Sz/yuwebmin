package com.calvus.yuwebmin.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.calvus.yuwebmin.dtos.response.PedidoResponseDTO;
import com.calvus.yuwebmin.models.Pedido;

/**
 * Mapper para o Pedido.
 * Converte a "Capa" do pedido e aciona automaticamente o ItemPedidoMapper para
 * converter a lista de itens junto.
 */
@Mapper(componentModel = "spring", uses = { ItemPedidoMapper.class })
public interface PedidoMapper {

    /**
     * Converte o Pedido completo para DTO de resposta.
     * 
     * @param pedido A entidade salva no banco de dados.
     * @return A nota fiscal formatada para o cliente.
     */
    @Mapping(target = "nomeCliente", source = "cliente.nome")
    PedidoResponseDTO toResponseDTO(Pedido pedido);

}
