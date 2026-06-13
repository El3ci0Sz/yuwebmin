package com.calvus.yuwebmin.dtos.response;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class ModeloMarmitaResponseDTO {
    private Long id;
    private String nome;
    private String descricao;
    private BigDecimal preco;
    private Integer limiteAcompanhamentos;
    private Boolean ativo;
}