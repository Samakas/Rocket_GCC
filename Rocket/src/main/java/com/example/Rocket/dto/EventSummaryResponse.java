package com.example.Rocket.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EventSummaryResponse {
    private String eventName;
    private Integer maximumCapacity;
    private long registeredCount;
    private long checkedInCount;
}
