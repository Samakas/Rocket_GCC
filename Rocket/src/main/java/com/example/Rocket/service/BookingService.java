package com.example.Rocket.service;

import com.example.Rocket.dto.RegistrationSummaryResponse;
import com.example.Rocket.entity.Booking;
import com.example.Rocket.entity.BookingStatus;
import com.example.Rocket.entity.Event;
import com.example.Rocket.entity.EventStatus;
import com.example.Rocket.entity.Role;
import com.example.Rocket.entity.User;
import com.example.Rocket.exception.ConflictException;
import com.example.Rocket.exception.ForbiddenRoleException;
import com.example.Rocket.exception.InvalidOperationException;
import com.example.Rocket.exception.ResourceNotFoundException;
import com.example.Rocket.repository.BookingRepository;
import com.example.Rocket.repository.EventRepository;
import com.example.Rocket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventService eventService;

    private User requireStudent(Long studentId) {
        User user = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
        if (user.getRole() != Role.STUDENT) {
            throw new ForbiddenRoleException("Only a STUDENT can access this resource");
        }
        return user;
    }

    @Transactional
    public Booking register(Long eventId, Long studentId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));
        User student = requireStudent(studentId);

        if (event.getStatus() != EventStatus.OPEN) {
            throw new InvalidOperationException("Event is not open for registration");
        }

        Booking existing = bookingRepository.findByStudentAndEvent(student, event).orElse(null);
        if (existing != null && existing.getStatus() != BookingStatus.CANCELLED) {
            throw new ConflictException("Student has already registered for this event");
        }

        long activeCount = bookingRepository.countByEventAndStatusIn(
                event, List.of(BookingStatus.REGISTERED, BookingStatus.CHECKED_IN));
        if (activeCount >= event.getMaximumCapacity()) {
            throw new InvalidOperationException("Event has reached maximum capacity");
        }

        Booking booking;
        if (existing != null) {
            existing.setStatus(BookingStatus.REGISTERED);
            existing.setRegisteredAt(LocalDateTime.now());
            existing.setCheckedInAt(null);
            booking = existing;
        } else {
            booking = new Booking(student, event);
        }
        booking = bookingRepository.save(booking);

        long newActiveCount = activeCount + 1;
        if (newActiveCount >= event.getMaximumCapacity()) {
            event.setStatus(EventStatus.CLOSED);
            eventRepository.save(event);
        }

        return booking;
    }

    @Transactional
    public Booking cancel(Long eventId, Long studentId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));
        User student = requireStudent(studentId);

        Booking booking = bookingRepository.findByStudentAndEvent(student, event)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found for this student and event"));

        if (booking.getStatus() != BookingStatus.REGISTERED) {
            throw new InvalidOperationException("Only a REGISTERED booking can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        if (event.getStatus() == EventStatus.CLOSED) {
            long activeCount = bookingRepository.countByEventAndStatusIn(
                    event, List.of(BookingStatus.REGISTERED, BookingStatus.CHECKED_IN));
            if (activeCount < event.getMaximumCapacity()) {
                event.setStatus(EventStatus.OPEN);
                eventRepository.save(event);
            }
        }

        return booking;
    }

    @Transactional
    public Booking checkIn(Long eventId, Long studentId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));
        User student = requireStudent(studentId);

        Booking booking = bookingRepository.findByStudentAndEvent(student, event)
                .orElseThrow(() -> new ResourceNotFoundException("Student is not registered for this event"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new InvalidOperationException("Cannot check in a cancelled booking");
        }
        if (booking.getStatus() == BookingStatus.CHECKED_IN) {
            throw new ConflictException("Student has already checked in");
        }

        if (!LocalDate.now().isEqual(event.getEventDate())) {
            throw new InvalidOperationException("Check-in is only allowed on the event date");
        }

        booking.setStatus(BookingStatus.CHECKED_IN);
        booking.setCheckedInAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    public List<RegistrationSummaryResponse> getRegistrationSummary(Long organizerId) {
        eventService.requireOrganizer(organizerId);
        return bookingRepository.findRegistrationSummary();
    }

    public List<Booking> getStudentBookings(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
        return bookingRepository.findByStudent(student);
    }

    public List<Booking> getEventRegistrations(Long eventId, Long organizerId) {
        eventService.requireOrganizer(organizerId);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));
        return bookingRepository.findByEvent(event);
    }

    @Transactional
    public Booking markAttendance(Long eventId, Long studentId, Long organizerId, boolean present) {
        eventService.requireOrganizer(organizerId);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        Booking booking = bookingRepository.findByStudentAndEvent(student, event)
                .orElseThrow(() -> new ResourceNotFoundException("Student is not registered for this event"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new InvalidOperationException("Cannot mark attendance for a cancelled booking");
        }

        if (!LocalDate.now().isEqual(event.getEventDate())) {
            throw new InvalidOperationException("Attendance can only be marked on the event date");
        }

        if (present) {
            booking.setStatus(BookingStatus.CHECKED_IN);
            booking.setCheckedInAt(LocalDateTime.now());
        } else {
            booking.setStatus(BookingStatus.ABSENT);
            booking.setCheckedInAt(null);
        }
        return bookingRepository.save(booking);
    }
}
