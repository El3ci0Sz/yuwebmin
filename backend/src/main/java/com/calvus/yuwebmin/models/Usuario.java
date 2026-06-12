package com.calvus.yuwebmin.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.calvus.yuwebmin.enums.NivelFidelidade;
import com.calvus.yuwebmin.enums.PapelUsuario;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "usuario")
@NoArgsConstructor
@Data
@AllArgsConstructor
public class Usuario implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    // E-mail deve ser unico
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String senha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PapelUsuario papel;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(name = "data_criacao", updatable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "xp_acumulado", nullable = false)
    private Integer xpAcumulado = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_fidelidade", nullable = false, length = 20)
    private NivelFidelidade nivel = NivelFidelidade.INICIANTE;

    @Column(name = "carimbos_fidelidade", nullable = false)
    private Integer carimbosFidelidade = 0;

    @Column(name = "recompensa_disponivel", nullable = false)
    private Boolean recompensaDisponivel = false;

    // Relacionamento com a classe endereços, um Usuario pode ter varios endereços
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Endereco> enderecos = new ArrayList<>();

    // Metodo que o spring chama automaticamente antes de fazer o INSERT no banco
    @PrePersist
    protected void onCreate() {
        this.dataCriacao = LocalDateTime.now();
    }

    // Ensina o Spring qual é a permissão (Role) deste usuário
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this.papel == PapelUsuario.ADMIN) {
            return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("ROLE_CLIENTE"));
        } else {
            return List.of(new SimpleGrantedAuthority("ROLE_CLIENTE"));
        }
    }

    // Ensina qual campo é a "senha"
    @Override
    public String getPassword() {
        return this.senha;
    }

    // Ensina qual campo é o "login" (no nosso caso, o e-mail)
    @Override
    public String getUsername() {
        return this.email;
    }

    // Validacoes
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.ativo;
    }
}
