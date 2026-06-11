package com.calvus.yuwebmin.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

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
import com.calvus.yuwebmin.repositories.ProdutoRepository;
import com.calvus.yuwebmin.repositories.UsuarioRepository;
import com.calvus.yuwebmin.utils.MensagensErro;

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

        if (requestDTO.getItens() == null || requestDTO.getItens().isEmpty()) {
            throw new RegraDeNegocioException("Não é possível registrar um pedido sem itens.");
        }

        String emailClienteLogado = SecurityContextHolder.getContext().getAuthentication().getName();

        Usuario cliente = usuarioService.buscarClientePorEmail(emailClienteLogado);

        // Criar o pedido
        Pedido novoPedido = new Pedido();
        novoPedido.setCliente(cliente);
        novoPedido.setStatus(StatusPedido.RECEBIDO);

        BigDecimal valorTotalDoPedido = BigDecimal.ZERO;

        for (ItemPedidoRequestDTO itemDto : requestDTO.getItens()) {
            Produto produto = produtoService.buscarPorId(itemDto.getProdutoId());

            ItemPedido novoItem = new ItemPedido();
            novoItem.setProduto(produto);
            novoItem.setPedido(novoPedido);
            novoItem.setQuantidade(itemDto.getQuantidade());
            novoItem.setPrecoUnitario(produto.getPreco());

            BigDecimal quantidadeDoItem = BigDecimal.valueOf(itemDto.getQuantidade());
            BigDecimal subTotalDoItem = produto.getPreco().multiply(quantidadeDoItem);

            valorTotalDoPedido = valorTotalDoPedido.add(subTotalDoItem);

            novoPedido.getItens().add(novoItem);
        }

        novoPedido.setValorTotal(valorTotalDoPedido);
        Pedido pedidoSalvo = pedidoRepository.save(novoPedido);

        return pedidoMapper.toResponseDTO(pedidoSalvo);

    }

    public List<PedidoResponseDTO> listarMeusPedidos() {
        String emailClienteLogado = SecurityContextHolder.getContext().getAuthentication().getName();

        List<Pedido> meusPedidos = pedidoRepository.findByCliente_Email(emailClienteLogado);

        return meusPedidos.stream()
                .map(pedidoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    ;

    public PedidoResponseDTO updateStatus(Long id, StatusPedido novoStatus) {
        Pedido pedido = buscarPedidoPorId(id);

        pedido.setStatus(novoStatus);

        return pedidoMapper.toResponseDTO(pedidoRepository.save(pedido));
    }

    // Metodos Utilitarios
    private Pedido buscarPedidoPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(MensagensErro.PEDIDO_NAO_ENCONTRADO_ID, id)));
    }
}
