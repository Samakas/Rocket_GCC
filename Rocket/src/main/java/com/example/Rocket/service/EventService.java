package com.example.Rocket.service;

import com.example.Rocket.dto.CreateEventRequest;
import com.example.Rocket.dto.EventSummaryResponse;
import com.example.Rocket.entity.BookingStatus;
import com.example.Rocket.entity.Event;
import com.example.Rocket.entity.Role;
import com.example.Rocket.entity.User;
import com.example.Rocket.exception.ForbiddenRoleException;
import com.example.Rocket.exception.InvalidOperationException;
import com.example.Rocket.exception.ResourceNotFoundException;
import com.example.Rocket.repository.BookingRepository;
import com.example.Rocket.repository.EventRepository;
import com.example.Rocket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public Event createEvent(CreateEventRequest request) {
        User organizer = userRepository.findById(request.getOrganizerId())
                .orElseThrow(() -> new ResourceNotFoundException("Organizer not found with id: " + request.getOrganizerId()));

        if (organizer.getRole() != Role.ORGANIZER) {
            throw new ForbiddenRoleException("Only an ORGANIZER can create an event");
        }

        if (request.getMaximumCapacity() == null || request.getMaximumCapacity() <= 0) {
            throw new InvalidOperationException("Maximum capacity must be greater than 0");
        }

        Event event = new Event(request.getEventName(), request.getEventDate(), request.getMaximumCapacity(), organizer);
        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
    }

    public EventSummaryResponse getEventSummary(Long id, Long organizerId) {
        requireOrganizer(organizerId);
        Event event = getEventById(id);
        long registeredCount = bookingRepository.countByEventAndStatusIn(
                event, List.of(BookingStatus.REGISTERED, BookingStatus.CHECKED_IN));
        long checkedInCount = bookingRepository.countByEventAndStatus(event, BookingStatus.CHECKED_IN);
        return new EventSummaryResponse(event.getEventName(), event.getMaximumCapacity(), registeredCount, checkedInCount);
    }

    public User requireOrganizer(Long organizerId) {
        User user = userRepository.findById(organizerId)
                .orElseThrow(() -> new ResourceNotFoundException("Organizer not found with id: " + organizerId));
        if (user.getRole() != Role.ORGANIZER) {
            throw new ForbiddenRoleException("Only an ORGANIZER can access this resource");
        }
        return user;
    }
}
