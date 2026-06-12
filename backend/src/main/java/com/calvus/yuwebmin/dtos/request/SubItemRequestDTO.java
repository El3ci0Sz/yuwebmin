package com.calvus.yuwebmin.dtos.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubItemRequestDTO {

    @NotNull(message = "O ID do complemento é obrigatório.")
    private Long produtoId;

    @NotNull(message = "A quantidade do complemento é obrigatória.")
    @Min(value = 1, message = "A quantidade mínima é 1.")
    private Integer quantidade;
}