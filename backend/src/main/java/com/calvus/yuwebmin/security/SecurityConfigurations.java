package com.calvus.yuwebmin.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfigurations {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))// API nao guarda
                                                                                                   // sessao do usuario
                .authorizeHttpRequests(req -> {
                    // O destrancar das portas
                    req.requestMatchers(HttpMethod.POST, "/usuarios").permitAll(); // Qualquer um pode se cadastrar
                    req.requestMatchers(HttpMethod.POST, "/login").permitAll(); // Qualquer um pode tentar fazer login

                    req.anyRequest().authenticated(); // Qualquer outra requisicao exige o token JWT
                }).build();
    }

    // Criptografar senhas
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
