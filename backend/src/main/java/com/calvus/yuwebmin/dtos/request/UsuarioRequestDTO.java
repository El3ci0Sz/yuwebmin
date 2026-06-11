package com.calvus.yuwebmin.dtos.request;

import com.calvus.yuwebmin.enums.PapelUsuario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UsuarioRequestDTO {

    @NotBlank(message = "O nome é obrigatorio")
    private String nome;

    @NotBlank(message = "O e-mail é obrigatotio")
    private String email;

    @NotBlank(message = "A senha é obrigatoria")
    @Size(min = 6, message = "A senha deve ter no minimo 6 caracteres")
    private String senha;

    private PapelUsuario papel;
}
