package com.backend.backend.user;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserService {
    @Autowired
    private UserRepo userRepo;
    
    private BCryptPasswordEncoder encoder=new BCryptPasswordEncoder(12);
    public User saveUser(User user){
        user.setPassword(encoder.encode(user.getPassword()));
        System.out.println(user.getPassword());
        User new_user=User
        .builder()
        .userName(user.getUserName())
        .password(user.getPassword())
        // .profileImage(user.getProfileImage())
        .build();
        return userRepo.save(new_user);
    }


    public List<User> getAllUser(){
        return userRepo.findAll();
    }


    public ResponseEntity<?> updateUser(Integer id,MultipartFile image){
        try{
            User user=userRepo.findById(id).orElse(null);
            user.setProfileImage(image.getBytes());
            userRepo.save(user);
           return ResponseEntity.status(HttpStatus.OK).body(userRepo.findById(id).orElse(null));
        } catch (Exception e) {
          System.out.println(e.getMessage());
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(userRepo.findById(id).orElse(null));
    }
}
