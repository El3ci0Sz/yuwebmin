package com.calvus.yuwebmin.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
import com.calvus.yuwebmin.models.Acompanhamento;
import com.calvus.yuwebmin.models.Endereco;
import com.calvus.yuwebmin.models.ItemPedido;
import com.calvus.yuwebmin.models.ModeloMarmita;
import com.calvus.yuwebmin.models.Pedido;
import com.calvus.yuwebmin.models.Produto;
import com.calvus.yuwebmin.models.SubItemPedido;
import com.calvus.yuwebmin.models.Usuario;
import com.calvus.yuwebmin.repositories.AcompanhamentoRepository;
import com.calvus.yuwebmin.repositories.ModeloMarmitaRepository;
import com.calvus.yuwebmin.repositories.PedidoRepository;
import com.calvus.yuwebmin.utils.MensagensDeErro;

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
    private final AcompanhamentoRepository acompanhamentoRepository;
    private final ModeloMarmitaRepository modeloMarmitaRepository;

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

        for (ItemPedidoRequestDTO itemDto : requestDTO.getItens()) {
            ItemPedido novoItem = construirItemPedido(itemDto, novoPedido);
            novoPedido.adicionarItem(novoItem);
        }

        if (cliente.getRecompensaDisponivel()) {
            novoPedido.setValorTotal(BigDecimal.ZERO);
            cliente.setRecompensaDisponivel(false);
        }

        return pedidoMapper.toResponseDTO(pedidoRepository.save(novoPedido));
    }

    public Page<PedidoResponseDTO> listarMeusPedidos(Pageable pageable) {
        String emailClienteLogado = obterEmailAutenticado();

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

    @Transactional
    public PedidoResponseDTO updateStatus(Long id, StatusPedido novoStatus) {
        Pedido pedido = buscarPedidoPorId(id);

        // Logica temporaria tem que ser alterada ainda
        if (novoStatus == StatusPedido.CONCLUIDO && pedido.getStatus() != StatusPedido.CONCLUIDO) {
            processarRecompensas(pedido.getCliente());
        }

        pedido.setStatus(novoStatus);

        return pedidoMapper.toResponseDTO(pedido);
    }

    public List<PedidoResponseDTO> listarTodosParaAdmin(StatusPedido status, Long id, String dataFiltro) {
        if (id != null) {
            return pedidoRepository.findById(id)
                    .map(p -> List.of(pedidoMapper.toResponseDTO(p)))
                    .orElse(List.of());
        }

        List<Pedido> pedidos = pedidoRepository.findAll();

        if (status != null) {
            pedidos = pedidos.stream().filter(p -> p.getStatus() == status).collect(Collectors.toList());
        }

        if (dataFiltro != null && !dataFiltro.isBlank()) {
            LocalDate dataBusca = LocalDate.parse(dataFiltro);
            pedidos = pedidos.stream()
                    .filter(p -> p.getDataPedido() != null && p.getDataPedido().toLocalDate().equals(dataBusca))
                    .collect(Collectors.toList());
        }

        return pedidos.stream()
                .map(pedidoMapper::toResponseDTO)
                .collect(Collectors.toList());
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
        String emailLogado = obterEmailAutenticado();
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

    /**
     * Monta a linha do pedido (ItemPedido), decidindo se é uma Marmita ou um
     * Produto Avulso.
     */
    private ItemPedido construirItemPedido(ItemPedidoRequestDTO dto, Pedido pedidoVinculado) {
        ItemPedido item = new ItemPedido();
        item.setPedido(pedidoVinculado);
        item.setQuantidade(dto.getQuantidade());

        if (dto.getModeloMarmitaId() != null) {

            ModeloMarmita marmita = modeloMarmitaRepository.findById(dto.getModeloMarmitaId())
                    .orElseThrow(() -> new RegraDeNegocioException("Modelo de marmita não encontrado."));

            int totalAcompanhamentos = 0;
            if (dto.getSubItens() != null) {
                totalAcompanhamentos = dto.getSubItens().stream()
                        .mapToInt(SubItemRequestDTO::getQuantidade)
                        .sum();
            }

            if (totalAcompanhamentos > marmita.getLimiteAcompanhamentos()) {
                throw new RegraDeNegocioException("A marmita " + marmita.getNome() +
                        " permite no máximo " + marmita.getLimiteAcompanhamentos() + " porções de acompanhamentos.");
            }

            item.setModeloMarmita(marmita);
            item.setPrecoUnitario(marmita.getPreco());

            if (dto.getSubItens() != null) {
                for (SubItemRequestDTO subDto : dto.getSubItens()) {
                    Acompanhamento acomp = acompanhamentoRepository.findById(subDto.getAcompanhamentoId())
                            .orElseThrow(() -> new RegraDeNegocioException("Acompanhamento não encontrado."));

                    SubItemPedido subItem = new SubItemPedido();
                    subItem.setAcompanhamento(acomp);
                    subItem.setQuantidade(subDto.getQuantidade());
                    item.adicionarSubItem(subItem);
                }
            }

        } else if (dto.getProdutoId() != null) {

            Produto produto = produtoService.buscarPorId(dto.getProdutoId());

            item.setProduto(produto);
            item.setPrecoUnitario(produto.getPreco());

        } else {
            throw new RegraDeNegocioException("A linha do pedido deve conter um produto ou uma marmita.");
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
        cliente.setNivel(NivelFidelidade.calcularPorXp(cliente.getXpAcumulado()));
    }

    private Pedido buscarPedidoPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(MensagensDeErro.PEDIDO_NAO_ENCONTRADO_ID, id)));
    }

    private String obterEmailAutenticado() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
