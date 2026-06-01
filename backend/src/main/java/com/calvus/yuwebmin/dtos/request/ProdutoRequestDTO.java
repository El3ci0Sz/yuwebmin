package com.calvus.yuwebmin.dtos.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
//DTO para receber dados do FrontEnd

@Data
public class ProdutoRequestDTO {
    @NotBlank(message = "O nome do produto não pode ficar em brando")
    private String nome;
    
    private String descricao;

    @NotNull(message = "A categoria é obrigatoria")
    private String categoria;
    
    @NotNull(message = "A categoria do produto é obrigatoria")
    @Positive(message = "O preço deve ser maior que zero")
    private BigDecimal preco;
    private Boolean itemFixo;
    private Boolean ativo;
    private String urlImagem;
}
