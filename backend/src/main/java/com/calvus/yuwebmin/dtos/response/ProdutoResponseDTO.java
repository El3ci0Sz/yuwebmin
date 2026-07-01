package com.calvus.yuwebmin.dtos.response;

import java.math.BigDecimal;

import com.calvus.yuwebmin.enums.CategoriaProduto;

import lombok.Data;
//DTO para devolver dados ao FrontEnd

@Data
public class ProdutoResponseDTO {

    private Long id;
    private String nome;
    private String descricao;
    private CategoriaProduto categoria;
    private BigDecimal preco;
    private Boolean itemFixo;
    private Boolean ativo;
    private String urlImagem;
    private String emoji;
}
