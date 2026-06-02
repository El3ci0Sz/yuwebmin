package com.calvus.yuwebmin.repositories;

import org.springframework.stereotype.Repository;
import com.calvus.yuwebmin.models.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
//Essa classe representa a interface nescessaria para conseguirmos conversar com o BD.

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long>{
    
}
