package com.calvus.yuwebmin.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.calvus.yuwebmin.models.ModeloMarmita;

public interface ModeloMarmitaRepository extends JpaRepository<ModeloMarmita, Long> {
    List<ModeloMarmita> findByAtivoTrue();
}
