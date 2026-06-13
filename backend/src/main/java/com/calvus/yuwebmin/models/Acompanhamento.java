package com.calvus.yuwebmin.models;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "acompanhamento")
public class Acompanhamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String descricao;

    @Column(name = "item_fixo", nullable = false)
    private Boolean itemFixo = false;

    private Boolean ativo = true;
}