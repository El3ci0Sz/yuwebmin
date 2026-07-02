package com.calvus.yuwebmin.dtos.response;

import lombok.Data;

@Data
public class AcompanhamentoResponseDTO {
    private Long id;
    private String nome;
    private String descricao;
    private Boolean itemFixo;
    private Boolean ativo;
    private String emoji;
}