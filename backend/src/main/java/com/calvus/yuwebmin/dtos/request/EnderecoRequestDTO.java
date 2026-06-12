package com.calvus.yuwebmin.dtos.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EnderecoRequestDTO {

    @NotBlank(message = "A rua é obrigatória.")
    private String rua;

    @NotBlank(message = "O número é obrigatório.")
    private String numero;

    @NotBlank(message = "O bairro é obrigatório.")
    private String bairro;

    private String cep;
    private String complemento;
}