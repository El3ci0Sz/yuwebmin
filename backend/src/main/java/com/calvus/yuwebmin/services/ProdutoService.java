package com.calvus.yuwebmin.services;

import org.springframework.stereotype.Service;

import com.calvus.yuwebmin.dtos.request.ProdutoRequestDTO;
import com.calvus.yuwebmin.dtos.response.ProdutoResponseDTO;
import com.calvus.yuwebmin.enums.CategoriaProduto;
import com.calvus.yuwebmin.exceptions.ResourceNotFoundException;
import com.calvus.yuwebmin.mappers.ProdutoMapper;
import com.calvus.yuwebmin.models.Produto;
import com.calvus.yuwebmin.repositories.ProdutoRepository;
import com.calvus.yuwebmin.utils.MensagensDeErro;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;

import lombok.RequiredArgsConstructor;

//Aqui aplicamos as regras de negocio, processa as requisições e gera as respostas.
@Service
@RequiredArgsConstructor
public class ProdutoService {
    private final ProdutoRepository produtoRepository;
    private final ProdutoMapper produtoMapper;

    // Criar novo produto
    public ProdutoResponseDTO create(ProdutoRequestDTO requestDTO) {

        // Converte o request no formato do objeto Produto
        Produto produto = produtoMapper.toModel(requestDTO);
        if (produto.getItemFixo() == null)
            produto.setItemFixo(false);
        if (produto.getAtivo() == null)
            produto.setAtivo(true);

        Produto produtoSalvo = produtoRepository.save(produto);

        return produtoMapper.toResponseDTO(produtoSalvo);
    }

    // Listar todos os produtos existentes
    public Page<ProdutoResponseDTO> findAll(Pageable pageable) {
        return produtoRepository.findAll(pageable).map(produtoMapper::toResponseDTO);

    }

    public Page<ProdutoResponseDTO> findAllAtivo(Pageable pageable) {
        return produtoRepository.findByAtivoTrue(pageable)
                .map(produtoMapper::toResponseDTO);
    }

    // Encontrar um produto pelo ID
    public ProdutoResponseDTO findByID(long id) {
        Produto produto = buscarPorId(id);

        return produtoMapper.toResponseDTO(produto);
    }

    // Atualizar um produto existente
    public ProdutoResponseDTO updateOneProduto(long id, ProdutoRequestDTO requestDTO) {

        Produto produtoExistente = buscarPorId(id);

        produtoMapper.atualizarModeloProduto(produtoExistente, requestDTO);

        Produto produtoAtualizado = produtoRepository.save(produtoExistente);

        return produtoMapper.toResponseDTO(produtoAtualizado);

    }

    // Deletar produto existente
    public void deleteOneProduto(long id) {

        Produto produtoDeletar = buscarPorId(id);
        produtoRepository.delete(produtoDeletar);
    }

    /**
     * Lista apenas produtos ativos, permitindo filtros opcionais da barra de
     * pesquisa e abas.
     */
    public Page<ProdutoResponseDTO> findAllAtivo(CategoriaProduto categoria, String busca, Pageable pageable) {
        return produtoRepository.buscarAtivosComFiltro(categoria, busca, pageable)
                .map(produtoMapper::toResponseDTO);
    }

    @Transactional
    public ProdutoResponseDTO alternarStatusAtivo(Long id) {
        Produto produto = buscarPorId(id);

        produto.setAtivo(!produto.getAtivo());

        return produtoMapper.toResponseDTO(produtoRepository.save(produto));
    }

    /**
     * Rotina automática ativada todos os dias às 05:00 da manhã (Horário de
     * Brasília).
     * Reseta o cardápio, mantendo ativos apenas os produtos com 'itemFixo = true'.
     */
    @Transactional
    @Scheduled(cron = "0 0 5 * * *", zone = "America/Sao_Paulo")
    public void rotinaDiariaDeCardapio() {
        produtoRepository.resetarCardapioParaItensFixos();
    }

    // Metodos Utilitarios
    public Produto buscarPorId(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(MensagensDeErro.PRODUTO_NAO_ENCONTRADO_ID, id)));
    }
}
