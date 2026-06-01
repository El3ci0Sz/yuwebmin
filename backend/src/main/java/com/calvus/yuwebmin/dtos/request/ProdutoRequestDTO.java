package com.calvus.yuwebmin.dtos.request;

import java.math.BigDecimal;
import lombok.Data;
//DTO para receber dados do FrontEnd

@Data
public class ProdutoRequestDTO {
    private String nome;
    private String descricao;
    private String categoria;
    private BigDecimal preco;
    private Boolean itemFixo;
    private Boolean ativo;
    private String urlImagem;
}
