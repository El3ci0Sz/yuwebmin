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

    // Se o cliente comprou uma bebida ou item por quilo, preenchemos este:
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id")
    private Produto produto;

    // Se o cliente comprou uma marmita, preenchemos este:
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modelo_marmita_id")
    private ModeloMarmita modeloMarmita;

    @ManyToOne
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "preco_unitario", nullable = false)
    private BigDecimal precoUnitario;

    // A LISTA QUE FALTAVA: Guarda os acompanhamentos escolhidos para esta marmita
    @OneToMany(mappedBy = "itemPedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubItemPedido> subItens = new ArrayList<>();

    // O MÉTODO QUE O VS CODE RECLAMOU QUE NÃO EXISTIA
    public void adicionarSubItem(SubItemPedido subItem) {
        subItens.add(subItem);
        subItem.setItemPedido(this);
    }

    public BigDecimal getSubTotal() {
        return this.precoUnitario.multiply(BigDecimal.valueOf(this.quantidade));
    }

}
