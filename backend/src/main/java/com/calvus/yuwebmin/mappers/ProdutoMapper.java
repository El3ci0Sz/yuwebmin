package com.calvus.yuwebmin.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.calvus.yuwebmin.dtos.request.ProdutoRequestDTO;
import com.calvus.yuwebmin.dtos.response.ProdutoResponseDTO;
import com.calvus.yuwebmin.models.Produto;

//Transforma essa interface em um componente spring.
@Mapper(componentModel = "spring")
public interface ProdutoMapper {
    
    //Metodo, converter de RequestDTO para Model (Entrada)
    Produto toModel(ProdutoRequestDTO requestDTO);

    //Metodo, converter de Model para RequestDTO (Saida)
    ProdutoResponseDTO toResponseDTO(Produto produto);
    
    void atualizarModeloProduto(@MappingTarget Produto produtoExistente, ProdutoRequestDTO requestDTO);

}
