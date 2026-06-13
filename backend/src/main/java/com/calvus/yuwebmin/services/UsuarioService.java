package com.calvus.yuwebmin.services;

import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.calvus.yuwebmin.dtos.request.EnderecoRequestDTO;
import com.calvus.yuwebmin.dtos.request.UsuarioRequestDTO;
import com.calvus.yuwebmin.dtos.response.EnderecoResponseDTO;
import com.calvus.yuwebmin.dtos.response.UsuarioResponseDTO;
import com.calvus.yuwebmin.enums.PapelUsuario;
import com.calvus.yuwebmin.exceptions.RegraDeNegocioException;
import com.calvus.yuwebmin.exceptions.ResourceNotFoundException;
import com.calvus.yuwebmin.mappers.EnderecoMapper;
import com.calvus.yuwebmin.mappers.UsuarioMapper;
import com.calvus.yuwebmin.models.Endereco;
import com.calvus.yuwebmin.models.Usuario;
import com.calvus.yuwebmin.repositories.UsuarioRepository;
import com.calvus.yuwebmin.utils.MensagensDeErro;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;
    private final EnderecoMapper enderecoMapper;

    public UsuarioResponseDTO create(UsuarioRequestDTO requestDTO) {
        if (usuarioRepository.findByEmail(requestDTO.getEmail()).isPresent()) {
            throw new RegraDeNegocioException(MensagensDeErro.EMAIL_DUPLICADO);
        }

        Usuario usuario = usuarioMapper.toModel(requestDTO);

        if (usuario.getPapel() == null) {
            usuario.setPapel(PapelUsuario.CLIENTE);

        }

        // Pega a senha e criptografa ela, e salva o codigo gerado no lugar.
        usuario.setSenha(passwordEncoder.encode(requestDTO.getSenha()));

        return usuarioMapper.toResponseDTO(usuarioRepository.save(usuario));
    }

    public Page<UsuarioResponseDTO> findAll(Pageable pageable) {
        return usuarioRepository.findAll(pageable).map(usuarioMapper::toResponseDTO);
    }

    public UsuarioResponseDTO findByID(long id) {
        Usuario usuario = buscarPorId(id);

        return usuarioMapper.toResponseDTO(usuario);
    }

    public UsuarioResponseDTO update(long id, UsuarioRequestDTO requestDTO) {

        Usuario usuarioExistente = buscarPorId(id);

        if (!usuarioExistente.getEmail().equals(requestDTO.getEmail())
                && usuarioRepository.findByEmail(requestDTO.getEmail()).isPresent()) {
            throw new RegraDeNegocioException(MensagensDeErro.EMAIL_DUPLICADO);
        }

        PapelUsuario papelAntigo = usuarioExistente.getPapel();

        usuarioMapper.atualizarModeloUsuario(usuarioExistente, requestDTO);

        if (usuarioExistente.getPapel() == null) {
            usuarioExistente.setPapel(papelAntigo);
        }

        return usuarioMapper.toResponseDTO(usuarioRepository.save(usuarioExistente));
    }

    public void delete(long id) {

        Usuario usuario = buscarPorId(id);
        usuarioRepository.delete(usuario);
    }

    /**
     * Cadastra um novo endereço na conta do cliente .
     */
    @Transactional
    public EnderecoResponseDTO adicionarEndereco(EnderecoRequestDTO request) {

        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario cliente = buscarClientePorEmail(emailLogado);

        Endereco novoEndereco = enderecoMapper.toEntity(request);

        novoEndereco.setUsuario(cliente);

        cliente.getEnderecos().add(novoEndereco);

        usuarioRepository.save(cliente);

        Endereco enderecoSalvo = cliente.getEnderecos().get(cliente.getEnderecos().size() - 1);

        return enderecoMapper.toResponseDTO(enderecoSalvo);
    }

    /**
     * Lista exclusivamente os endereços da carteira do cliente autenticado.
     */
    public List<EnderecoResponseDTO> listarMeusEnderecos() {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario cliente = buscarClientePorEmail(emailLogado);

        // Transforma a lista de Entidades em lista de DTOs
        return cliente.getEnderecos().stream()
                .map(enderecoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // Metodos Utilitarios

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(MensagensDeErro.USUARIO_NAO_ENCONTRADO_ID, id)));
    }

    public Usuario buscarClientePorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(MensagensDeErro.CLIENTE_NAO_ENCONTRADO));
    }

    /**
     * Retorna o perfil completo do usuário que está logado no momento
     */
    public UsuarioResponseDTO obterPerfilLogado() {
        String emailLogado = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario cliente = buscarClientePorEmail(emailLogado);
        return usuarioMapper.toResponseDTO(cliente);
    }
}
