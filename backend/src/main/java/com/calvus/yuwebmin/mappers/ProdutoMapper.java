package com.calvus.yuwebmin.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.calvus.yuwebmin.dtos.request.ProdutoRequestDTO;
import com.calvus.yuwebmin.dtos.response.ProdutoResponseDTO;
import com.calvus.yuwebmin.models.Produto;

//Transforma essa interface em um componente spring.
@Mapper(componentModel = "spring")
public interface ProdutoMapper {

    // Metodo, converter de RequestDTO para Model (Entrada)
    @Mapping(target = "id", ignore = true)
    Produto toModel(ProdutoRequestDTO requestDTO);

    // Metodo, converter de Model para RequestDTO (Saida)
    ProdutoResponseDTO toResponseDTO(Produto produto);

    @Mapping(target = "id", ignore = true)
    void atualizarModeloProduto(@MappingTarget Produto produtoExistente, ProdutoRequestDTO requestDTO);

}
