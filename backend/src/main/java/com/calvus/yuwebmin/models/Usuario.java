package com.calvus.yuwebmin.models;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "usuario")
@NoArgsConstructor
@Data
@AllArgsConstructor
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)    
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String nome;

    //E-mail deve ser unico
    @Column(nullable =  false, unique = true, length = 100)
    private String email;

    @Column(nullable =  false)
    private String senha;

    @Column(nullable =  false, length = 20)
    private String papel;
    
    @Column(nullable =  false)
    private Boolean ativo = true;
    
    @Column(name = "data_criacao", updatable = false)
    private LocalDateTime dataCriacao;
    
    // Metodo que o spring chama automaticamente antes de fazer o INSERT no banco
    @PrePersist
    protected void onCreate() {
        this.dataCriacao = LocalDateTime.now();
    }
}
