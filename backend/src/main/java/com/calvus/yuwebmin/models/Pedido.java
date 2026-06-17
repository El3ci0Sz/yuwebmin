package com.calvus.yuwebmin.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

import com.calvus.yuwebmin.enums.MetodoPagamento;
import com.calvus.yuwebmin.enums.StatusPedido;
import com.calvus.yuwebmin.enums.TipoEntrega;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pedido")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario cliente;

    // Nao precisamos criar um repository para items pedido, pois ao salvar o Pedido
    // ira salvar tambem o ItemPedido.
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedido> itens = new ArrayList<>();

    @Column(name = "data_pedido", nullable = false, updatable = false)
    private LocalDateTime dataPedido;

    // Salva o nome do Status por extenso, inves de usar o indice numerico.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusPedido status;

    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_entrega", nullable = false, length = 20)
    private TipoEntrega tipoEntrega;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pagamento", nullable = false, length = 20)
    private MetodoPagamento metodoPagamento;

    // Se o pagamento for DINHEIRO, quanto o entregador precisa levar de troco?
    @Column(name = "valor_troco", precision = 10, scale = 2)
    private BigDecimal valorTroco;

    // A ligação com o endereço que o cliente escolheu para esta compra específica
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endereco_entrega_id")
    private Endereco enderecoEntrega;

    @PrePersist
    protected void onCreate() {
        this.dataPedido = LocalDateTime.now(ZoneId.of("America/Sao_Paulo"));
        if (this.status == null) {
            this.status = StatusPedido.RECEBIDO;
        }
    }

    public void adicionarItem(ItemPedido item) {
        this.itens.add(item);
        this.valorTotal = this.valorTotal.add(item.getSubTotal());
    }

    public void recalcularTotal() {
        this.valorTotal = this.itens.stream()
                .map(ItemPedido::getSubTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
