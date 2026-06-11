package com.calvus.yuwebmin.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.calvus.yuwebmin.models.Pedido;

/**
 * Repositório de Pedidos.
 * Representa a interface de comunicação direta com a tabela 'pedido' no banco
 * de dados.
 * No sistema, é responsável por persistir as notas fiscais e buscar os
 * históricos de compras dos clientes.
 */

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    /**
     * Busca todo o histórico de compras de um cliente específico utilizando o
     * e-mail dele.
     * O Spring Data JPA traduz "Cliente_Email" para a navegação na propriedade
     * pedido.cliente.email.
     */
    Page<Pedido> findByCliente_Email(String email, Pageable pageable);
}