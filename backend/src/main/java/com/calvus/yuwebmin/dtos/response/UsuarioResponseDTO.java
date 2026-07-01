package com.calvus.yuwebmin.dtos.response;

import java.time.LocalDateTime;
import java.util.List;

import com.calvus.yuwebmin.enums.NivelFidelidade;
import com.calvus.yuwebmin.enums.PapelUsuario;

import lombok.Data;

@Data
public class UsuarioResponseDTO {

    private Long id;
    private String nome;
    private String email;
    private PapelUsuario papel;
    private Boolean ativo;
    private LocalDateTime dataCriacao;
    private Integer carimbosFidelidade;
    private Boolean recompensaDisponivel;
    private Integer xpAcumulado;
    // Alias amigável de xpAcumulado, para bater com o campo "points" esperado pelo frontend.
    private Integer pontos;
    private NivelFidelidade nivel;
    private List<EnderecoResponseDTO> enderecos;
}
