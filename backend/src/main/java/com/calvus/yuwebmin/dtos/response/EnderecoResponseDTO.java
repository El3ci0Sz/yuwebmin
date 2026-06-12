package com.calvus.yuwebmin.dtos.response;

import lombok.Data;

@Data
public class EnderecoResponseDTO {
    private Long id;
    private String rua;
    private String numero;
    private String bairro;
    private String cep;
    private String complemento;
}