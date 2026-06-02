package com.calvus.yuwebmin.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.calvus.yuwebmin.dtos.request.LoginRequestDTO;
import com.calvus.yuwebmin.dtos.response.LoginResponseDTO;
import com.calvus.yuwebmin.models.Usuario;
import com.calvus.yuwebmin.security.TokenService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/login")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    @PostMapping
    public ResponseEntity<LoginResponseDTO> efetuarLogin(@Valid @RequestBody LoginRequestDTO requestDTO) {
        // Cria um token temporario
        var tokenTemporario = new UsernamePasswordAuthenticationToken(requestDTO.email(), requestDTO.senha());

        // Pega a senha criptograda e testa se a senha digitada bate
        Authentication auteticacao = authenticationManager.authenticate(tokenTemporario);

        // Se chegou aqui a senha esta correta
        // Geramos a JWT
        Usuario usuarioAutenticado = (Usuario) auteticacao.getPrincipal();
        String tokenJWT = tokenService.generateToken(usuarioAutenticado);

        return ResponseEntity.ok(new LoginResponseDTO(tokenJWT));
    }

}
