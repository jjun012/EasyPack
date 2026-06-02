package com.easypack.backend.service;

import com.easypack.backend.dto.UserUpdateRequestDTO;
import com.easypack.backend.model.User;
import com.easypack.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(String userId, String password, String nickname,
                         String travelDestination, String airline) {
        if (userRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("이미 존재하는 사용자 ID입니다.");
        }
        String encodedPassword = passwordEncoder.encode(password);
        User user = new User(userId, encodedPassword, nickname, travelDestination, airline);
        return userRepository.save(user);
    }

    public User authenticate(String userId, String password) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("비밀번호가 올바르지 않습니다.");
        }
        return user;
    }

    public User findByUserId(String userId) {
        return userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }

    @Transactional
    public void updateUserInfo(String userId, UserUpdateRequestDTO request) {
        User user = findByUserId(userId);
        if (request.getNickname() != null) user.setNickname(request.getNickname());
        if (request.getTravelDestination() != null) user.setTravelDestination(request.getTravelDestination());
        if (request.getAirline() != null) user.setAirline(request.getAirline());
        userRepository.save(user);
    }
}