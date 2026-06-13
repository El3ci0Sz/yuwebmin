package com.calvus.yuwebmin.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import jakarta.servlet.DispatcherType;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfigurations {

    private final SecurityFilter securityFilter;

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers(
                "/v3/api-docs",
                "/v3/api-docs/**",
                "/swagger-ui.html",
                "/swagger-ui/**");
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(Customizer.withDefaults()) // Adicionado apenas para o painel de testes HTML funcionar (CORS)
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(req -> {
                    // 1. Manutenção da sua estrutura original
                    req.dispatcherTypeMatchers(DispatcherType.ERROR).permitAll();
                    req.requestMatchers("/v3/api-docs", "/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**")
                            .permitAll();

                    // Permite o Preflight do navegador (evita o erro CORS 403)
                    req.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();

                    // 2. Rotas públicas de autenticação (Ajustado para /auth/login como no
                    // controller)
                    req.requestMatchers(HttpMethod.POST, "/usuarios").permitAll();
                    req.requestMatchers(HttpMethod.POST, "/auth/login").permitAll();

                    // 3. Vitrines públicas do novo domínio (Necessário para a tela do cliente)
                    req.requestMatchers(HttpMethod.GET, "/produtos/ativos").permitAll();
                    req.requestMatchers(HttpMethod.GET, "/acompanhamentos/ativos").permitAll();
                    req.requestMatchers(HttpMethod.GET, "/modelos-marmitas/ativos").permitAll();

                    // 4. Regras do ADMIN
                    req.requestMatchers(HttpMethod.GET, "/estatisticas/dashboard").hasRole("ADMIN");
                    req.requestMatchers(HttpMethod.PATCH, "/pedidos/*/status").hasRole("ADMIN");

                    // Acesso total (CRUD) para as 3 categorias focado no ADMIN
                    req.requestMatchers(HttpMethod.POST, "/produtos/**", "/acompanhamentos/**", "/modelos-marmitas/**")
                            .hasRole("ADMIN");
                    req.requestMatchers(HttpMethod.PUT, "/produtos/**", "/acompanhamentos/**", "/modelos-marmitas/**")
                            .hasRole("ADMIN");
                    req.requestMatchers(HttpMethod.PATCH, "/produtos/**", "/acompanhamentos/**", "/modelos-marmitas/**")
                            .hasRole("ADMIN");
                    req.requestMatchers(HttpMethod.DELETE, "/produtos/**", "/acompanhamentos/**",
                            "/modelos-marmitas/**").hasRole("ADMIN");

                    // 5. Qualquer outra ação (ex: fazer pedido, ver endereços) exige login
                    req.anyRequest().authenticated();
                })
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}