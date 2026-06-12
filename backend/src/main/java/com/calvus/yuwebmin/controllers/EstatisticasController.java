package com.calvus.yuwebmin.controllers;

import com.calvus.yuwebmin.dtos.response.DashboardResponseDTO;
import com.calvus.yuwebmin.services.EstatisticasService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/estatisticas")
@RequiredArgsConstructor
public class EstatisticasController {

    private final EstatisticasService estatisticasService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponseDTO> obterDashboard() {
        return ResponseEntity.ok(estatisticasService.gerarDashboard());
    }
}