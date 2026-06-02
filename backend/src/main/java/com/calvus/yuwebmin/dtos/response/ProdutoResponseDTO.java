package com.calvus.yuwebmin.dtos.response;

import java.math.BigDecimal;
import lombok.Data;
//DTO para devolver dados ao FrontEnd

@Data
public class ProdutoResponseDTO {

    private Long id;
    private String nome;
    private String descricao;
    private String categoria;
    private BigDecimal preco;
    private Boolean itemFixo;
    private Boolean ativo;
    private String urlImagem;
}
