package com.example.Rocket.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateEventRequest {
    private String eventName;
    private LocalDate eventDate;
    private Integer maximumCapacity;
    private Long organizerId;
}
