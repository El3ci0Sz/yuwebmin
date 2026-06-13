package com.calvus.yuwebmin.dtos.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ModeloMarmitaRequestDTO {

    @NotBlank(message = "O nome do modelo é obrigatório.")
    private String nome;

    private String descricao;

    @NotNull(message = "O preço base é obrigatório.")
    @Min(value = 0, message = "O preço não pode ser negativo.")
    private BigDecimal preco;

    @NotNull(message = "O limite de acompanhamentos é obrigatório.")
    @Min(value = 1, message = "O limite mínimo é 1 acompanhamento.")
    private Integer limiteAcompanhamentos;

    private Boolean ativo = true;
}