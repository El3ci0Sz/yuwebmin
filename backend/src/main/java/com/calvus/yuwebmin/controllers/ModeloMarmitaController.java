package com.calvus.yuwebmin.controllers;

import com.calvus.yuwebmin.dtos.request.ModeloMarmitaRequestDTO;
import com.calvus.yuwebmin.dtos.response.ModeloMarmitaResponseDTO;
import com.calvus.yuwebmin.services.ModeloMarmitaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/modelos-marmitas")
@RequiredArgsConstructor
public class ModeloMarmitaController {

    private final ModeloMarmitaService service;

    @PostMapping
    public ResponseEntity<ModeloMarmitaResponseDTO> criar(@RequestBody @Valid ModeloMarmitaRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ModeloMarmitaResponseDTO> atualizar(@PathVariable Long id,
            @RequestBody @Valid ModeloMarmitaRequestDTO request) {
        return ResponseEntity.ok(service.atualizar(id, request));
    }

    @GetMapping
    public ResponseEntity<List<ModeloMarmitaResponseDTO>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<ModeloMarmitaResponseDTO>> listarAtivos() {
        return ResponseEntity.ok(service.listarAtivos());
    }

    @PatchMapping("/{id}/ativo")
    public ResponseEntity<Void> alternarStatus(@PathVariable Long id) {
        service.alternarStatus(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}