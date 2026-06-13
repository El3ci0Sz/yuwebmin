package com.calvus.yuwebmin.dtos.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AcompanhamentoRequestDTO {

    @NotBlank(message = "O nome do acompanhamento é obrigatório.")
    private String nome;

    private String descricao;

    private Boolean itemFixo = false;

    private Boolean ativo;

}