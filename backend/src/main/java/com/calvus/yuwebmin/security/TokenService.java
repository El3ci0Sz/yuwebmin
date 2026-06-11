package com.calvus.yuwebmin.security;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.calvus.yuwebmin.models.Usuario;
import org.springframework.beans.factory.annotation.Value;

@Service
public class TokenService {

    // Senha mestre da API
    // Vem do application.properties por segurança
    @Value("${api.security.token.secret}")
    private String secret;

    public String generateToken(Usuario usuario) {
        try {
            Algorithm algoritmo = Algorithm.HMAC256(secret);

            return JWT.create()
                    .withIssuer("YuWebMin API") // Quem emitiu o token
                    .withSubject(usuario.getEmail()) // Quem é o dono do token
                    .withClaim("papel", usuario.getPapel().name()) // Guardamos o papel dentro do token para facilitar!
                    .withExpiresAt(dataExpiracao()) // Data de validade (ex: 2 horas)
                    .sign(algoritmo); // Assina e finaliza

        } catch (JWTCreationException exception) {
            throw new RuntimeException("Erro ao gerar token JWT", exception);
        }
    }

    public String getSubject(String tokenJWT) {
        try {
            Algorithm algoritmo = Algorithm.HMAC256(secret);
            return JWT.require(algoritmo)
                    .withIssuer("YuWebMin API")
                    .build()
                    .verify(tokenJWT)
                    .getSubject();
        } catch (JWTVerificationException exception) {
            throw new RuntimeException("Token JWT inválido ou expirado!");
        }
    }

    // Token nao pode durar para sempre, ele vai durar 2 horas
    private Instant dataExpiracao() {
        return LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00"));
    }
}
