package com.calvus.yuwebmin.models;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ItemPedido")
public class ItemPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @ManyToOne
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "preco_unitario", nullable = false)
    private BigDecimal precoUnitario;

    public BigDecimal getSubTotal() {
        return this.precoUnitario.multiply(BigDecimal.valueOf(this.quantidade));
    }

    // Uma linha do pedido (Marmita M) pode conter vários subitens (Arroz, Feijão,
    // etc.)
    @OneToMany(mappedBy = "itemPedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubItemPedido> subItens = new ArrayList<>();

    // Método utilitário para facilitar a montagem no Service
    public void adicionarSubItem(SubItemPedido subItem) {
        subItens.add(subItem);
        subItem.setItemPedido(this);
    }
}
