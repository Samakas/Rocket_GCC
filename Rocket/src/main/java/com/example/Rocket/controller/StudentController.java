package com.example.Rocket.controller;

import com.example.Rocket.entity.Booking;
import com.example.Rocket.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final BookingService bookingService;

    @GetMapping("/{studentId}/bookings")
    public List<Booking> getBookings(@PathVariable Long studentId) {
        return bookingService.getStudentBookings(studentId);
    }
}
