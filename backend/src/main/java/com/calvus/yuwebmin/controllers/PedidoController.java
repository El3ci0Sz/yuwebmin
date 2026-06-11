package com.calvus.yuwebmin.controllers;

import com.calvus.yuwebmin.repositories.UsuarioRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.calvus.yuwebmin.dtos.request.AtualizarStatusPedidoDTO;
import com.calvus.yuwebmin.dtos.request.PedidoRequestDTO;
import com.calvus.yuwebmin.dtos.response.PedidoResponseDTO;
import com.calvus.yuwebmin.services.PedidoService;
import com.calvus.yuwebmin.utils.UriUtils;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Controlador de Pedidos (A Porta de Entrada das Vendas).
 * Responsável por expor as rotas HTTP (endpoints) relacionadas ao processo de
 * compras.
 * No sistema, atua como a "frente de caixa", recebendo o carrinho do cliente e
 * devolvendo o recibo oficial.
 */

@RestController
@RequestMapping("/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final UsuarioRepository usuarioRepository;
    private final PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<PedidoResponseDTO> create(@Valid @RequestBody PedidoRequestDTO requestDTO) {

        PedidoResponseDTO response = pedidoService.createPedido(requestDTO);
        return ResponseEntity.created(UriUtils.criarUriDeRecurso(response.getId())).body(response);
    }

    @GetMapping("/meus-pedidos")
    public ResponseEntity<List<PedidoResponseDTO>> listarMeusPedidos() {
        return ResponseEntity.ok(pedidoService.listarMeusPedidos());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PedidoResponseDTO> updateStatus(@PathVariable Long id,
            @Valid @RequestBody AtualizarStatusPedidoDTO statusDTO) {
        PedidoResponseDTO response = pedidoService.updateStatus(id, statusDTO.getNovoStatus());
        return ResponseEntity.ok(response);
    }
}
