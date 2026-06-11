package com.calvus.yuwebmin.models;

import java.math.BigDecimal;

import com.calvus.yuwebmin.dtos.response.ProdutoResponseDTO;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

//Essa classe Produto, representa uma tabela no banco de dados.
@Entity
@Table(name = "produto")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(length = 255)
    private String descricao;

    @Column(nullable = false, length = 50)
    private String categoria;

    private BigDecimal preco;

    @Column(name = "item_fixo", nullable = false)
    private Boolean itemFixo = false;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(name = "url_imagem", length = 255)
    private String urlImagem;
}
