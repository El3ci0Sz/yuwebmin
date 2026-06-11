package com.calvus.yuwebmin.services;

import java.math.BigDecimal;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.calvus.yuwebmin.dtos.request.ItemPedidoRequestDTO;
import com.calvus.yuwebmin.dtos.request.PedidoRequestDTO;
import com.calvus.yuwebmin.dtos.response.PedidoResponseDTO;
import com.calvus.yuwebmin.enums.StatusPedido;
import com.calvus.yuwebmin.exceptions.RegraDeNegocioException;
import com.calvus.yuwebmin.exceptions.ResourceNotFoundException;
import com.calvus.yuwebmin.mappers.PedidoMapper;
import com.calvus.yuwebmin.models.ItemPedido;
import com.calvus.yuwebmin.models.Pedido;
import com.calvus.yuwebmin.models.Produto;
import com.calvus.yuwebmin.models.Usuario;
import com.calvus.yuwebmin.repositories.PedidoRepository;
import com.calvus.yuwebmin.utils.MensagensDeErro;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

/**
 * Serviço de Pedidos (O Cérebro Financeiro e Logístico).
 * Esta classe centraliza toda a regra de negócio relacionada à criação de uma
 * compra.
 * No sistema, ela garante que os preços cobrados são os do momento da compra e
 * vincula o pedido ao cliente autenticado.
 */

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final PedidoMapper pedidoMapper;
    private final ProdutoService produtoService;
    private final UsuarioService usuarioService;

    /**
     * Processa o carrinho de compras do frontend, calcula o total e salva no banco.
     * Ocultamos do frontend a necessidade de enviar o ID do cliente ou o preço do
     * produto por segurança.
     * * @param requestDTO O DTO contendo a lista de IDs de produtos e suas
     * quantidades.
     * 
     * @return PedidoResponseDTO A nota fiscal gerada com os detalhes completos da
     *         compra.
     */

    // @Transactional: Se der um erro, desfaz tudo que tinha feito no banco de dados
    @Transactional
    public PedidoResponseDTO createPedido(PedidoRequestDTO requestDTO) {

        validarCarrinho(requestDTO);

        Pedido novoPedido = new Pedido();

        novoPedido.setCliente(obterClienteAutenticado());
        novoPedido.setStatus(StatusPedido.RECEBIDO);

        BigDecimal valorTotal = BigDecimal.ZERO;

        for (ItemPedidoRequestDTO itemDto : requestDTO.getItens()) {
            ItemPedido novoItem = construirItemPedido(itemDto, novoPedido);
            valorTotal = valorTotal.add(novoItem.getSubTotal());

            novoPedido.adicionarItem(novoItem);
        }

        novoPedido.setValorTotal(valorTotal);

        return pedidoMapper.toResponseDTO(pedidoRepository.save(novoPedido));

    }

    public Page<PedidoResponseDTO> listarMeusPedidos(Pageable pageable) {
        String emailClienteLogado = SecurityContextHolder.getContext().getAuthentication().getName();

        return pedidoRepository.findByCliente_Email(emailClienteLogado, pageable)
                .map(pedidoMapper::toResponseDTO);
    }

    /**
     * Lista absolutamente todos os pedidos do restaurante de forma paginada.
     */
    public Page<PedidoResponseDTO> findAll(Pageable pageable) {
        return pedidoRepository.findAll(pageable)
                .map(pedidoMapper::toResponseDTO);
    }

    public PedidoResponseDTO updateStatus(Long id, StatusPedido novoStatus) {
        Pedido pedido = buscarPedidoPorId(id);

        pedido.setStatus(novoStatus);

        return pedidoMapper.toResponseDTO(pedidoRepository.save(pedido));
    }

    // Metodos Utilitarios

    /**
     * Valida se a requisição do frontend contém itens válidos antes de iniciar o
     * processamento.
     */

    private void validarCarrinho(PedidoRequestDTO requestDTO) {
        if (requestDTO.getItens() == null || requestDTO.getItens().isEmpty()) {
            throw new RegraDeNegocioException(MensagensDeErro.CARRINHO_VAZIO);
        }
    }

    private Usuario obterClienteAutenticado() {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioService.buscarClientePorEmail(emailLogado);
    }

    private ItemPedido construirItemPedido(ItemPedidoRequestDTO dto, Pedido pedidoVinculado) {
        Produto produto = produtoService.buscarPorId(dto.getProdutoId());

        ItemPedido item = new ItemPedido();
        item.setProduto(produto);
        item.setPedido(pedidoVinculado);
        item.setQuantidade(dto.getQuantidade());
        item.setPrecoUnitario(produto.getPreco());

        return item;
    }

    private Pedido buscarPedidoPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(MensagensDeErro.PEDIDO_NAO_ENCONTRADO_ID, id)));
    }
}
