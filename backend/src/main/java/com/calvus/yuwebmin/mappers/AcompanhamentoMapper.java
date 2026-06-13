package com.calvus.yuwebmin.mappers;

import org.mapstruct.Mapper;

import com.calvus.yuwebmin.dtos.request.AcompanhamentoRequestDTO;
import com.calvus.yuwebmin.dtos.response.AcompanhamentoResponseDTO;
import com.calvus.yuwebmin.models.Acompanhamento;

@Mapper(componentModel = "spring")
public interface AcompanhamentoMapper {

    Acompanhamento toEntity(AcompanhamentoRequestDTO dto);

    AcompanhamentoResponseDTO toResponseDTO(Acompanhamento entity);
}
