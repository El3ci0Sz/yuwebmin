package com.calvus.yuwebmin.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.calvus.yuwebmin.dtos.request.ProdutoRequestDTO;
import com.calvus.yuwebmin.dtos.response.ProdutoResponseDTO;
import com.calvus.yuwebmin.services.ProdutoService;
import com.calvus.yuwebmin.utils.UriUtils;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

//Recebe requisicao, repassa para o service, e depois envia a resposta.
@RestController
@RequestMapping("/produtos")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoService produtoService;

    // CREATE
    @PostMapping
    public ResponseEntity<ProdutoResponseDTO> createProduto(@Valid @RequestBody ProdutoRequestDTO requestDTO) {
        ProdutoResponseDTO response = produtoService.create(requestDTO);

        return ResponseEntity.created(UriUtils.criarUriDeRecurso(response.getId())).body(response);
    }

    // READ (all)
    @GetMapping
    public ResponseEntity<Page<ProdutoResponseDTO>> findAll(
            @PageableDefault(size = 10, page = 0, sort = "nome") Pageable pageable) {
        return ResponseEntity.ok(produtoService.findAll(pageable));
    }

    // READ (id)
    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> findyID(@PathVariable long id) {
        return ResponseEntity.ok(produtoService.findByID(id));
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> update(@PathVariable long id,
            @Valid @RequestBody ProdutoRequestDTO requestDTO) {

        return ResponseEntity.ok(produtoService.updateOneProduto(id, requestDTO));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> delete(@PathVariable long id) {
        produtoService.deleteOneProduto(id);
        return ResponseEntity.noContent().build();
    }

}
