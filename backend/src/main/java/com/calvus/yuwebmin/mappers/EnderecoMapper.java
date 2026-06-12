package com.calvus.yuwebmin.mappers;

import com.calvus.yuwebmin.dtos.request.EnderecoRequestDTO;
import com.calvus.yuwebmin.dtos.response.EnderecoResponseDTO;
import com.calvus.yuwebmin.models.Endereco;
import org.mapstruct.Mapper;

/**
 * Mapper para a entidade Endereco.
 * Automatiza a conversão de dados entre as camadas de transporte e de banco.
 */
@Mapper(componentModel = "spring")
public interface EnderecoMapper {

    Endereco toEntity(EnderecoRequestDTO dto);

    EnderecoResponseDTO toResponseDTO(Endereco entity);
}