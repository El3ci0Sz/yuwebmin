package com.calvus.yuwebmin.mappers;

import com.calvus.yuwebmin.dtos.request.ModeloMarmitaRequestDTO;
import com.calvus.yuwebmin.dtos.response.ModeloMarmitaResponseDTO;
import com.calvus.yuwebmin.models.ModeloMarmita;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ModeloMarmitaMapper {

    ModeloMarmita toEntity(ModeloMarmitaRequestDTO requestDTO);

    ModeloMarmitaResponseDTO toResponseDTO(ModeloMarmita entity);
}