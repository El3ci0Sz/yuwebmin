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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

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

    private final PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<PedidoResponseDTO> create(@Valid @RequestBody PedidoRequestDTO requestDTO) {

        PedidoResponseDTO response = pedidoService.createPedido(requestDTO);
        return ResponseEntity.created(UriUtils.criarUriDeRecurso(response.getId())).body(response);
    }

    @GetMapping("/meus-pedidos")
    public ResponseEntity<Page<PedidoResponseDTO>> listarMeusPedidos(
            @PageableDefault(size = 5, page = 0, sort = "dataPedido") Pageable pageable) {
        return ResponseEntity.ok(pedidoService.listarMeusPedidos(pageable));
    }

    @GetMapping
    public ResponseEntity<Page<PedidoResponseDTO>> findAll(
            @PageableDefault(size = 15, page = 0, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(pedidoService.findAll(pageable));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PedidoResponseDTO> updateStatus(@PathVariable Long id,
            @Valid @RequestBody AtualizarStatusPedidoDTO statusDTO) {
        PedidoResponseDTO response = pedidoService.updateStatus(id, statusDTO.getNovoStatus());
        return ResponseEntity.ok(response);
    }
}
