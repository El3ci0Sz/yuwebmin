package com.calvus.yuwebmin.repositories;

import com.calvus.yuwebmin.enums.CategoriaProduto;
import com.calvus.yuwebmin.models.Produto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
//Essa classe representa a interface nescessaria para conseguirmos conversar com o BD.
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    Page<Produto> findByAtivoTrue(Pageable pageable);

    /**
     * Atualiza todos os produtos de uma vez:
     * O campo 'ativo' copia o valor exato do campo 'item_fixo'.
     * O que for fixo continua ativo, o que não for, vira inativo (false).
     */
    @Modifying
    @Query("UPDATE Produto p SET p.ativo = p.itemFixo")
    void resetarCardapioParaItensFixos();

    /**
     * Traz sempre ativo = true. Se o frontend não mandar categoria ou busca, traz
     * tudo.
     */
    @Query("SELECT p FROM Produto p WHERE p.ativo = true " +
            "AND (:categoria IS NULL OR p.categoria = :categoria) " +
            "AND (:busca IS NULL OR LOWER(p.nome) LIKE LOWER(CONCAT('%', :busca, '%')))")
    Page<Produto> buscarAtivosComFiltro(
            @Param("categoria") CategoriaProduto categoria,
            @Param("busca") String busca,
            Pageable pageable);
}
