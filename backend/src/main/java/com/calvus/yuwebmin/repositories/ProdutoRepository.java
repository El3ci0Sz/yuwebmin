package com.calvus.yuwebmin.repositories;

import com.calvus.yuwebmin.models.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
//Essa classe representa a interface nescessaria para conseguirmos conversar com o BD.

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

}
