package com.calvus.yuwebmin.controllers;

import com.calvus.yuwebmin.dtos.request.AcompanhamentoRequestDTO;
import com.calvus.yuwebmin.dtos.response.AcompanhamentoResponseDTO;
import com.calvus.yuwebmin.services.AcompanhamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/acompanhamentos")
@RequiredArgsConstructor
public class AcompanhamentoController {

    private final AcompanhamentoService acompanhamentoService;

    @PostMapping
    public ResponseEntity<AcompanhamentoResponseDTO> criar(@RequestBody @Valid AcompanhamentoRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(acompanhamentoService.criar(request));
    }

    @GetMapping
    public ResponseEntity<List<AcompanhamentoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(acompanhamentoService.listarTodos());
    }

    @PatchMapping("/{id}/ativo")
    public ResponseEntity<Void> alternarStatus(@PathVariable Long id) {
        acompanhamentoService.alternarStatus(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<AcompanhamentoResponseDTO>> listarAtivos(
            @RequestParam(required = false) String busca) {
        return ResponseEntity.ok(acompanhamentoService.listarAtivos(busca));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AcompanhamentoResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid AcompanhamentoRequestDTO request) {
        return ResponseEntity.ok(acompanhamentoService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        acompanhamentoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}