package com.example.Rocket.repository;

import com.example.Rocket.dto.RegistrationSummaryResponse;
import com.example.Rocket.entity.Booking;
import com.example.Rocket.entity.BookingStatus;
import com.example.Rocket.entity.Event;
import com.example.Rocket.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByStudentAndEvent(User student, Event event);

    List<Booking> findByStudent(User student);

    List<Booking> findByEvent(Event event);

    long countByEventAndStatusIn(Event event, List<BookingStatus> statuses);

    long countByEventAndStatus(Event event, BookingStatus status);

    @Query("""
            SELECT e.eventName AS eventName, COUNT(b) AS registrationCount
            FROM Event e LEFT JOIN Booking b ON b.event = e AND b.status IN ('REGISTERED', 'CHECKED_IN')
            GROUP BY e.id, e.eventName
            ORDER BY COUNT(b) DESC
            """)
    List<RegistrationSummaryResponse> findRegistrationSummary();
}
