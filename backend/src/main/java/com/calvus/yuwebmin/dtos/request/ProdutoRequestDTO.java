package com.calvus.yuwebmin.dtos.request;

import java.math.BigDecimal;

import com.calvus.yuwebmin.enums.CategoriaProduto;

import jakarta.validation.constraints.DecimalMin;
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
    private CategoriaProduto categoria;

    @NotNull(message = "A preço do produto é obrigatoria")
    @Positive(message = "O preço deve ser maior que zero")
    @DecimalMin(value = "0.01", message = "O preço mínimo é R$ 0,01")
    private BigDecimal preco;
    private Boolean itemFixo = false;
    private Boolean ativo = true;
    private String urlImagem;
}
