package com.calvus.yuwebmin.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Entidade SubItemPedido.
 * Representa os complementos escolhidos para compor uma Marmita (ex: Arroz,
 * Feijão).
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

    // A qual linha da nota fiscal este complemento pertence?
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_pedido_id", nullable = false)
    private ItemPedido itemPedido;

    // Qual é o produto real do cardápio? (O Arroz, o Feijão)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Column(nullable = false)
    private Integer quantidade;

    // Congela o preço do complemento no momento da compra (caso os complementos
    // sejam cobrados à parte)
    @Column(name = "preco_unitario", nullable = false)
    private BigDecimal precoUnitario = BigDecimal.ZERO;

    public BigDecimal getSubTotal() {
        return this.precoUnitario.multiply(BigDecimal.valueOf(this.quantidade));
    }
}