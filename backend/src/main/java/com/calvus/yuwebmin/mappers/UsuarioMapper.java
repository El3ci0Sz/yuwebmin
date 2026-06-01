package com.calvus.yuwebmin.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.calvus.yuwebmin.dtos.request.UsuarioRequestDTO;
import com.calvus.yuwebmin.dtos.response.UsuarioResponseDTO;
import com.calvus.yuwebmin.models.Usuario;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ativo", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    Usuario toModel(UsuarioRequestDTO requestDTO);

    UsuarioResponseDTO toResponseDTO(Usuario usuario);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ativo", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    void atualizarModeloUsuario(@MappingTarget Usuario usuarioExistente, UsuarioRequestDTO requestDTO);
    
}
