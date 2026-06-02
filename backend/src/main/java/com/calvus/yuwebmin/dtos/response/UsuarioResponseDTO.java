package com.calvus.yuwebmin.dtos.response;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UsuarioResponseDTO {
    
    private Long id;
    private String nome;
    private String email;
    private String papel;
    private Boolean ativo;
    private LocalDateTime dataCriacao;
}
