package com.calvus.yuwebmin.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.calvus.yuwebmin.models.Acompanhamento;

public interface AcompanhamentoRepository extends JpaRepository<Acompanhamento, Long> {
    List<Acompanhamento> findByAtivoTrueAndNomeContainingIgnoreCase(String nome);

    List<Acompanhamento> findByAtivoTrue();
}
