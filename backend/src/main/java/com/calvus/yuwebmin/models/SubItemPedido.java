package com.calvus.yuwebmin.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidade SubItemPedido.
 * Representa a quantidade de um acompanhamento específico escolhido para compor
 * uma Marmita.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sub_item_pedido")
public class SubItemPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // A qual linha da nota fiscal (Marmita) este complemento pertence?
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_pedido_id", nullable = false)
    private ItemPedido itemPedido;

    // Qual é o acompanhaemtno escolhido? (O Arroz, o Feijão)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acompanhamento_id", nullable = false)
    private Acompanhamento acompanhamento;

    // Quantas porções deste acompanhamento o cliente colocou?
    @Column(nullable = false)
    private Integer quantidade;

}