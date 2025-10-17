// In backend/src/main/java/com/gramalertplus/repository/UserRepository.java

package com.gramalertplus.repository;

import com.gramalertplus.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}