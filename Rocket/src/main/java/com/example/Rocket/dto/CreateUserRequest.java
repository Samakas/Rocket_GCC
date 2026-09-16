package com.example.Rocket.dto;

import com.example.Rocket.entity.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUserRequest {
    private String name;
    private String email;
    private Role role;
}
