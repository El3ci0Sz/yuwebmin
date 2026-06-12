package com.calvus.yuwebmin.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.calvus.yuwebmin.dtos.request.EnderecoRequestDTO;
import com.calvus.yuwebmin.dtos.request.UsuarioRequestDTO;
import com.calvus.yuwebmin.dtos.response.EnderecoResponseDTO;
import com.calvus.yuwebmin.dtos.response.UsuarioResponseDTO;
import com.calvus.yuwebmin.services.UsuarioService;
import com.calvus.yuwebmin.utils.UriUtils;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> create(@Valid @RequestBody UsuarioRequestDTO requestDTO) {
        ;
        UsuarioResponseDTO response = usuarioService.create(requestDTO);

        return ResponseEntity.created(UriUtils.criarUriDeRecurso(response.getId())).body(response);
    }

    /**
     * Rota HTTP POST para o cliente logado adicionar um novo local de entrega.
     * 
     * @return Status 201 (Created) com os dados do endereço gerado.
     */
    @PostMapping("/meus-enderecos")
    public ResponseEntity<EnderecoResponseDTO> adicionarEndereco(@RequestBody @Valid EnderecoRequestDTO request) {
        EnderecoResponseDTO response = usuarioService.adicionarEndereco(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<UsuarioResponseDTO>> findAll(
            @PageableDefault(size = 12, page = 0, sort = "nome") Pageable pageable) {
        return ResponseEntity.ok(usuarioService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> findByID(@PathVariable long id) {
        return ResponseEntity.ok(usuarioService.findByID(id));
    }

    @GetMapping("/meus-enderecos")
    public ResponseEntity<List<EnderecoResponseDTO>> listarMeusEnderecos() {
        return ResponseEntity.ok(usuarioService.listarMeusEnderecos());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> update(@Valid @RequestBody UsuarioRequestDTO requestDTO,
            @PathVariable long id) {
        return ResponseEntity.ok(usuarioService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> delete(@PathVariable long id) {
        usuarioService.delete(id);
        return ResponseEntity.noContent().build();
    }

}