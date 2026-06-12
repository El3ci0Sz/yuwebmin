package com.calvus.yuwebmin.services;

import java.math.BigDecimal;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.calvus.yuwebmin.dtos.request.ItemPedidoRequestDTO;
import com.calvus.yuwebmin.dtos.request.PedidoRequestDTO;
import com.calvus.yuwebmin.dtos.request.SubItemRequestDTO;
import com.calvus.yuwebmin.dtos.response.PedidoResponseDTO;
import com.calvus.yuwebmin.enums.NivelFidelidade;
import com.calvus.yuwebmin.enums.StatusPedido;
import com.calvus.yuwebmin.enums.TipoEntrega;
import com.calvus.yuwebmin.exceptions.RegraDeNegocioException;
import com.calvus.yuwebmin.exceptions.ResourceNotFoundException;
import com.calvus.yuwebmin.mappers.PedidoMapper;
import com.calvus.yuwebmin.models.Endereco;
import com.calvus.yuwebmin.models.ItemPedido;
import com.calvus.yuwebmin.models.Pedido;
import com.calvus.yuwebmin.models.Produto;
import com.calvus.yuwebmin.models.SubItemPedido;
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
     */

    // @Transactional: Se der um erro, desfaz tudo que tinha feito no banco de dados
    @Transactional
    public PedidoResponseDTO createPedido(PedidoRequestDTO requestDTO) {

        validarCarrinho(requestDTO);

        Pedido novoPedido = new Pedido();
        Usuario cliente = obterClienteAutenticado();

        novoPedido.setCliente(cliente);
        novoPedido.setStatus(StatusPedido.RECEBIDO);
        configurarLogisticaEPagamento(novoPedido, requestDTO, cliente);

        BigDecimal valorTotal = processarItensECalcularTotal(requestDTO, novoPedido);

        for (ItemPedidoRequestDTO itemDto : requestDTO.getItens()) {
            ItemPedido novoItem = construirItemPedido(itemDto, novoPedido);
            valorTotal = valorTotal.add(novoItem.getSubTotal());

            novoPedido.adicionarItem(novoItem);
        }

        if (cliente.getRecompensaDisponivel()) {
            // Zera o valor total da nota fiscal
            valorTotal = BigDecimal.ZERO;

            // Queima a recompensa para voltar a contar na próxima
            cliente.setRecompensaDisponivel(false);
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

        // Logica temporaria tem que ser alterada ainda
        if (novoStatus == StatusPedido.CONCLUIDO && pedido.getStatus() != StatusPedido.CONCLUIDO) {
            processarRecompensas(pedido.getCliente());
        }

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

    /**
     * Extrai a lógica visual do método principal para configurar como e para onde o
     * pedido vai.
     */
    private void configurarLogisticaEPagamento(Pedido pedido, PedidoRequestDTO request, Usuario cliente) {
        pedido.setTipoEntrega(request.getTipoEntrega());
        pedido.setMetodoPagamento(request.getMetodoPagamento());
        pedido.setValorTroco(request.getValorTroco());

        if (request.getTipoEntrega() == TipoEntrega.ENTREGA) {
            if (request.getEnderecoEntregaId() == null) {
                throw new RegraDeNegocioException("Para entrega via Delivery, o endereço é obrigatório.");
            }

            Endereco enderecoEscolhido = cliente.getEnderecos().stream()
                    .filter(end -> end.getId().equals(request.getEnderecoEntregaId()))
                    .findFirst()
                    .orElseThrow(
                            () -> new RegraDeNegocioException("Endereço inválido ou não pertence a este usuário."));

            pedido.setEnderecoEntrega(enderecoEscolhido);
        }
    }

    private BigDecimal processarItensECalcularTotal(PedidoRequestDTO request, Pedido pedido) {
        BigDecimal total = BigDecimal.ZERO;

        for (ItemPedidoRequestDTO itemDto : request.getItens()) {
            ItemPedido novoItem = construirItemPedido(itemDto, pedido);
            total = total.add(novoItem.getSubTotal());
            pedido.adicionarItem(novoItem);
        }

        return total;
    }

    private ItemPedido construirItemPedido(ItemPedidoRequestDTO dto, Pedido pedidoVinculado) {
        Produto produto = produtoService.buscarPorId(dto.getProdutoId());

        ItemPedido item = new ItemPedido();
        item.setProduto(produto);
        item.setPedido(pedidoVinculado);
        item.setQuantidade(dto.getQuantidade());
        item.setPrecoUnitario(produto.getPreco());

        if (dto.getSubItens() != null && !dto.getSubItens().isEmpty()) {

            for (SubItemRequestDTO subDto : dto.getSubItens()) {
                Produto produtoSub = produtoService.buscarPorId(subDto.getProdutoId());

                SubItemPedido subItem = new SubItemPedido();
                subItem.setProduto(produtoSub);
                subItem.setQuantidade(subDto.getQuantidade());
                subItem.setPrecoUnitario(produtoSub.getPreco());

                item.adicionarSubItem(subItem);
            }
        }

        return item;
    }

    /**
     * Calcula e atribui os pontos e a evolução de nível do cliente.
     * Método provisório: Adiciona valores fixos até a aprovação da regra de negócio
     * final.
     */
    private void processarRecompensas(Usuario cliente) {
        // TODO: Substituir por regra do stakeholder (pontos por produto ou por valor
        // final do pedido)
        cliente.setXpAcumulado(cliente.getXpAcumulado() + 10);
        atualizarNivelFidelidade(cliente);

        // A Regra do Cartão de Carimbos (Exemplo: 10 selos = 1 prêmio)
        final int MAX_CARIMBOS = 10;

        // Só carimba se o cliente NÃO tiver uma recompensa pendente
        if (!cliente.getRecompensaDisponivel()) {
            cliente.setCarimbosFidelidade(cliente.getCarimbosFidelidade() + 1);

            // Se bateu a meta, zera a cartela e libera o prêmio para a próxima compra
            if (cliente.getCarimbosFidelidade() >= MAX_CARIMBOS) {
                cliente.setCarimbosFidelidade(0);
                cliente.setRecompensaDisponivel(true);
            }
        }
    }

    /**
     * Avalia o XP acumulado do usuário e atualiza o seu nível de fidelidade.
     * Define as faixas de corte para a transição automática de categorias (Level
     * Up).
     */
    private void atualizarNivelFidelidade(Usuario cliente) {
        int xp = cliente.getXpAcumulado();

        if (xp >= 1000) {
            cliente.setNivel(NivelFidelidade.DIAMANTE);
        } else if (xp >= 500) {
            cliente.setNivel(NivelFidelidade.OURO);
        } else if (xp >= 200) {
            cliente.setNivel(NivelFidelidade.PRATA);
        } else if (xp >= 50) {
            cliente.setNivel(NivelFidelidade.BRONZE);
        } else {
            cliente.setNivel(NivelFidelidade.INICIANTE);
        }
    }

    private Pedido buscarPedidoPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(MensagensDeErro.PEDIDO_NAO_ENCONTRADO_ID, id)));
    }
}
