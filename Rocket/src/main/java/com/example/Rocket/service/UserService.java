package com.example.Rocket.service;

import com.example.Rocket.dto.CreateUserRequest;
import com.example.Rocket.entity.User;
import com.example.Rocket.exception.ResourceNotFoundException;
import com.example.Rocket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User createUser(CreateUserRequest request) {
        User user = new User(request.getName(), request.getEmail(), request.getRole());
        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
