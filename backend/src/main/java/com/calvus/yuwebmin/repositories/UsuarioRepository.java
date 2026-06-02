package com.calvus.yuwebmin.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.calvus.yuwebmin.models.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Vai procurar e retornar um Usuario pelo email dele
    Optional<Usuario> findByEmail(String email);
    
}
