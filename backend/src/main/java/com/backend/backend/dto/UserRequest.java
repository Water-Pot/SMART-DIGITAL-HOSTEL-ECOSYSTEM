package com.backend.backend.dto;

import java.util.List;

import lombok.Data;

@Data
public class UserRequest {
    private String userName;
    private String password;
    private List<String> role;
}
