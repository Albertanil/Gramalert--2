// In backend/src/main/java/com/gramalertplus/repository/GrievanceRepository.java

package com.gramalertplus.repository;

import com.gramalertplus.entity.Grievance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrievanceRepository extends JpaRepository<Grievance, Long> {

    // highlight-start
    // We are replacing the derived query with an explicit JPQL query 
    // to ensure it always works correctly.
    @Query("SELECT g FROM Grievance g WHERE g.userId = :userId ORDER BY g.createdAt DESC")
    List<Grievance> findGrievancesByUserId(@Param("userId") Long userId);
    // highlight-end
}