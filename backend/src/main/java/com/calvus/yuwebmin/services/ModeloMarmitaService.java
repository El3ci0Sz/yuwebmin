package com.calvus.yuwebmin.services;

import com.calvus.yuwebmin.dtos.request.ModeloMarmitaRequestDTO;
import com.calvus.yuwebmin.dtos.response.ModeloMarmitaResponseDTO;
import com.calvus.yuwebmin.mappers.ModeloMarmitaMapper;
import com.calvus.yuwebmin.models.ModeloMarmita;
import com.calvus.yuwebmin.repositories.ModeloMarmitaRepository;
import com.calvus.yuwebmin.exceptions.RegraDeNegocioException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModeloMarmitaService {

    private final ModeloMarmitaRepository repository;
    private final ModeloMarmitaMapper mapper;

    @Transactional
    public ModeloMarmitaResponseDTO criar(ModeloMarmitaRequestDTO request) {
        ModeloMarmita modelo = mapper.toEntity(request);
        return mapper.toResponseDTO(repository.save(modelo));
    }

    @Transactional
    public ModeloMarmitaResponseDTO atualizar(Long id, ModeloMarmitaRequestDTO request) {
        ModeloMarmita modelo = repository.findById(id)
                .orElseThrow(() -> new RegraDeNegocioException("Modelo de marmita não encontrado."));

        modelo.setNome(request.getNome());
        modelo.setDescricao(request.getDescricao());
        modelo.setPreco(request.getPreco());
        modelo.setLimiteAcompanhamentos(request.getLimiteAcompanhamentos());
        modelo.setAtivo(request.getAtivo());

        return mapper.toResponseDTO(repository.save(modelo));
    }

    public List<ModeloMarmitaResponseDTO> listarTodos() {
        return repository.findAll().stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<ModeloMarmitaResponseDTO> listarAtivos() {
        return repository.findByAtivoTrue().stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void alternarStatus(Long id) {
        ModeloMarmita modelo = repository.findById(id)
                .orElseThrow(() -> new RegraDeNegocioException("Modelo não encontrado."));
        modelo.setAtivo(!modelo.getAtivo());
        repository.save(modelo);
    }

    @Transactional
    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new RegraDeNegocioException("Modelo não encontrado.");
        }
        repository.deleteById(id);
    }
}