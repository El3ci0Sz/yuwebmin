package com.calvus.yuwebmin.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.calvus.yuwebmin.dtos.request.UsuarioRequestDTO;
import com.calvus.yuwebmin.dtos.response.UsuarioResponseDTO;
import com.calvus.yuwebmin.exceptions.RegraDeNegocioException;
import com.calvus.yuwebmin.exceptions.ResourceNotFoundException;
import com.calvus.yuwebmin.mappers.UsuarioMapper;
import com.calvus.yuwebmin.models.Usuario;
import com.calvus.yuwebmin.repositories.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;

    public UsuarioResponseDTO create(UsuarioRequestDTO requestDTO) {
        if (usuarioRepository.findByEmail(requestDTO.getEmail()).isPresent()) {
            throw new RegraDeNegocioException("Ja existe um usuario cadastrado com esse email");
        }

        Usuario usuario = usuarioMapper.toModel(requestDTO);

        if (usuario.getPapel() == null || usuario.getPapel().isBlank()) {
            usuario.setPapel("CLIENTE");

        }

        // Pega a senha e criptografa ela, e salva o codigo gerado no lugar.
        usuario.setSenha(passwordEncoder.encode(requestDTO.getSenha()));

        return usuarioMapper.toResponseDTO(usuarioRepository.save(usuario));
    }

    public List<UsuarioResponseDTO> findAll() {
        return usuarioRepository.findAll().stream().map(usuarioMapper::toResponseDTO).collect(Collectors.toList());
    }

    public UsuarioResponseDTO findByID(long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado pelo ID: " + id));

        return usuarioMapper.toResponseDTO(usuario);
    }

    public UsuarioResponseDTO update(long id, UsuarioRequestDTO requestDTO) {

        Usuario usuarioExistente = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado pelo ID: " + id));

        if (!usuarioExistente.getEmail().equals(requestDTO.getEmail())
                && usuarioRepository.findByEmail(requestDTO.getEmail()).isPresent()) {
            throw new RegraDeNegocioException("Este email ja esta sendo usado por outro usuario.");
        }

        String papelAntigo = usuarioExistente.getPapel();

        usuarioMapper.atualizarModeloUsuario(usuarioExistente, requestDTO);

        if (usuarioExistente.getPapel() == null || usuarioExistente.getPapel().isBlank()) {
            usuarioExistente.setPapel(papelAntigo);
        }

        return usuarioMapper.toResponseDTO(usuarioRepository.save(usuarioExistente));
    }

    public void delete(long id) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado pelo ID: " + id));
        usuarioRepository.delete(usuario);
    }
}
