package com.example.Rocket.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String eventName;

    private LocalDate eventDate;

    private Integer maximumCapacity;

    @Enumerated(EnumType.STRING)
    private EventStatus status;

    @ManyToOne
    @JoinColumn(name = "organizer_id")
    private User organizer;

    public Event(String eventName, LocalDate eventDate, Integer maximumCapacity, User organizer) {
        this.eventName = eventName;
        this.eventDate = eventDate;
        this.maximumCapacity = maximumCapacity;
        this.organizer = organizer;
        this.status = EventStatus.OPEN;
    }
}
