package com.calvus.yuwebmin.services;

import org.springframework.stereotype.Service;

import com.calvus.yuwebmin.dtos.request.ProdutoRequestDTO;
import com.calvus.yuwebmin.dtos.response.ProdutoResponseDTO;
import com.calvus.yuwebmin.exceptions.ResourceNotFoundException;
import com.calvus.yuwebmin.mappers.ProdutoMapper;
import com.calvus.yuwebmin.models.Produto;
import com.calvus.yuwebmin.repositories.ProdutoRepository;
import com.calvus.yuwebmin.utils.MensagensDeErro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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

    // Metodos Utilitarios
    public Produto buscarPorId(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(MensagensDeErro.PRODUTO_NAO_ENCONTRADO_ID, id)));
    }
}
