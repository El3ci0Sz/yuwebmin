package com.calvus.yuwebmin.services;

import com.calvus.yuwebmin.dtos.request.AcompanhamentoRequestDTO;
import com.calvus.yuwebmin.dtos.response.AcompanhamentoResponseDTO;
import com.calvus.yuwebmin.exceptions.RegraDeNegocioException;
import com.calvus.yuwebmin.mappers.AcompanhamentoMapper;
import com.calvus.yuwebmin.models.Acompanhamento;
import com.calvus.yuwebmin.repositories.AcompanhamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AcompanhamentoService {

    private final AcompanhamentoRepository acompanhamentoRepository;
    private final AcompanhamentoMapper acompanhamentoMapper;

    @Transactional
    public AcompanhamentoResponseDTO criar(AcompanhamentoRequestDTO request) {
        Acompanhamento novo = acompanhamentoMapper.toEntity(request);

        novo.setAtivo(true); // Nasce ativo por padrão

        if (novo.getItemFixo() == null) {
            novo.setItemFixo(false);
        }

        return acompanhamentoMapper.toResponseDTO(acompanhamentoRepository.save(novo));
    }

    public List<AcompanhamentoResponseDTO> listarTodos() {
        return acompanhamentoRepository.findAll().stream()
                .map(acompanhamentoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Liga ou desliga o ingrediente do cardápio do dia.
     */
    @Transactional
    public void alternarStatus(Long id) {
        Acompanhamento acompanhamento = acompanhamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Acompanhamento não encontrado."));

        acompanhamento.setAtivo(!acompanhamento.getAtivo());
        acompanhamentoRepository.save(acompanhamento);
    }

    /**
     * Atualiza
     */
    @Transactional
    public AcompanhamentoResponseDTO atualizar(Long id, AcompanhamentoRequestDTO request) {
        Acompanhamento acompanhamento = acompanhamentoRepository.findById(id)
                .orElseThrow(() -> new RegraDeNegocioException("Acompanhamento não encontrado."));

        acompanhamento.setNome(request.getNome());
        acompanhamento.setDescricao(request.getDescricao());
        acompanhamento.setItemFixo(request.getItemFixo());
        acompanhamento.setAtivo(request.getAtivo());

        return acompanhamentoMapper.toResponseDTO(acompanhamentoRepository.save(acompanhamento));
    }

    /**
     * Delete.
     */
    @Transactional
    public void deletar(Long id) {
        Acompanhamento acompanhamento = acompanhamentoRepository.findById(id)
                .orElseThrow(() -> new RegraDeNegocioException("Acompanhamento não encontrado."));
        acompanhamentoRepository.delete(acompanhamento);
    }

    /**
     * Retorna apenas os acompanhamentos ativos do dia, permitindo busca por texto.
     */
    public List<AcompanhamentoResponseDTO> listarAtivos(String busca) {
        List<Acompanhamento> lista;

        if (busca == null || busca.isBlank()) {
            lista = acompanhamentoRepository.findByAtivoTrue();
        } else {
            lista = acompanhamentoRepository.findByAtivoTrueAndNomeContainingIgnoreCase(busca);
        }

        return lista.stream()
                .map(acompanhamentoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}