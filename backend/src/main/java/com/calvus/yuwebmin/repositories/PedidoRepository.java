package com.calvus.yuwebmin.repositories;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.calvus.yuwebmin.enums.StatusPedido;
import com.calvus.yuwebmin.models.Pedido;

/**
 * Repositório de Pedidos.
 * Representa a interface de comunicação direta com a tabela 'pedido' no banco
 * de dados.
 * No sistema, é responsável por persistir as notas fiscais e buscar os
 * históricos de compras dos clientes.
 */

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    /**
     * Busca todo o histórico de compras de um cliente específico utilizando o
     * e-mail dele.
     * O Spring Data JPA traduz "Cliente_Email" para a navegação na propriedade
     * pedido.cliente.email.
     */
    Page<Pedido> findByCliente_Email(String email, Pageable pageable);

    // Conta a quantidade de pedidos num período
    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.status = :status AND p.dataPedido >= :inicio AND p.dataPedido <= :fim")
    Long contarPedidosPorPeriodo(StatusPedido status, LocalDateTime inicio, LocalDateTime fim);

    // Soma o dinheiro (faturamento) num período
    @Query("SELECT COALESCE(SUM(p.valorTotal), 0) FROM Pedido p WHERE p.status = :status AND p.dataPedido >= :inicio AND p.dataPedido <= :fim")
    BigDecimal somarFaturamentoPorPeriodo(StatusPedido status, LocalDateTime inicio, LocalDateTime fim);

    // Conta pedidos que estão em um status específico (para ver a fila da cozinha)
    Long countByStatus(StatusPedido status);

    List<Pedido> findByStatus(StatusPedido status);
}