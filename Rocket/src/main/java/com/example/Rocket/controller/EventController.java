package com.example.Rocket.controller;

import com.example.Rocket.dto.CreateEventRequest;
import com.example.Rocket.dto.EventSummaryResponse;
import com.example.Rocket.dto.RegistrationSummaryResponse;
import com.example.Rocket.entity.Booking;
import com.example.Rocket.entity.Event;
import com.example.Rocket.service.BookingService;
import com.example.Rocket.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody CreateEventRequest request) {
        Event event = eventService.createEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }

    @GetMapping
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/{id}")
    public Event getEvent(@PathVariable Long id) {
        return eventService.getEventById(id);
    }

    @GetMapping("/{id}/summary")
    public EventSummaryResponse getEventSummary(@PathVariable Long id, @RequestParam Long organizerId) {
        return eventService.getEventSummary(id, organizerId);
    }

    @PostMapping("/{eventId}/register/{studentId}")
    public ResponseEntity<Booking> register(@PathVariable Long eventId, @PathVariable Long studentId) {
        Booking booking = bookingService.register(eventId, studentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @DeleteMapping("/{eventId}/register/{studentId}")
    public Booking cancel(@PathVariable Long eventId, @PathVariable Long studentId) {
        return bookingService.cancel(eventId, studentId);
    }

    @PostMapping("/{eventId}/check-in/{studentId}")
    public Booking checkIn(@PathVariable Long eventId, @PathVariable Long studentId) {
        return bookingService.checkIn(eventId, studentId);
    }

    @GetMapping("/registration-summary")
    public List<RegistrationSummaryResponse> registrationSummary(@RequestParam Long organizerId) {
        return bookingService.getRegistrationSummary(organizerId);
    }

    @GetMapping("/{eventId}/registrations")
    public List<Booking> getRegistrations(@PathVariable Long eventId, @RequestParam Long organizerId) {
        return bookingService.getEventRegistrations(eventId, organizerId);
    }

    @PostMapping("/{eventId}/attendance/{studentId}")
    public Booking markAttendance(
            @PathVariable Long eventId,
            @PathVariable Long studentId,
            @RequestParam Long organizerId,
            @RequestParam boolean present) {
        return bookingService.markAttendance(eventId, studentId, organizerId, present);
    }
}
