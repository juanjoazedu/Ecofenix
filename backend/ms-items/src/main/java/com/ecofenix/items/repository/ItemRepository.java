package com.ecofenix.items.repository;

import com.ecofenix.items.model.entity.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findBySellerId(Long sellerId);

    @Query("SELECT DISTINCT i FROM Item i JOIN i.categories c WHERE c.id IN :categoryIds")
    List<Item> findByCategoryIds(@Param("categoryIds") List<Long> categoryIds);

    @Query(value = "SELECT * FROM items i " +
            "WHERE LOWER(i.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(i.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "ORDER BY " +
            "CASE " +
            "  WHEN LOWER(i.name) LIKE LOWER(CONCAT(:query, '%')) THEN 1 " +
            "  WHEN LOWER(i.name) LIKE LOWER(CONCAT('%', :query, '%')) THEN 2 " +
            "  ELSE 3 " +
            "END",
            nativeQuery = true)
    Page<Item> searchItems(@Param("query") String query, Pageable pageable);
}