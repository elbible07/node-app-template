// calendarView.js - Handles all calendar-related functionality

// Main function to load the calendar view
async function loadCalendar() {
    console.log('Loading calendar view');
    // Get calendar container
    const calendarElement = document.getElementById('calendar');
    if (!calendarElement) {
        console.error('Calendar element not found');
        return;
    }
    
    calendarElement.innerHTML = '<div class="loading-message">Loading calendar...</div>';
    
    try {
        // Fetch all events initially using the DataModel
        const events = await DataModel.getEvents();
        
        // Also fetch joined events to know which ones the user has already joined
        const joinedEvents = await DataModel.getJoinedEvents();
        const joinedEventIds = joinedEvents.map(event => event.event_id);
        
        // Populate sport and location filters with unique values
        populateFilters(events);
        
        // Set up filter event handlers
        setupFilterHandlers(events, joinedEventIds);
        
        // Initial calendar render with ALL events, not just joined ones
        renderCalendar(new Date(), events, joinedEventIds);
    } catch (error) {
        console.error('Error loading calendar:', error);
        calendarElement.innerHTML = '<div class="error-message">Failed to load calendar. Please try again later.</div>';
    }
}

// Populate filter dropdowns with unique values from events
function populateFilters(events) {
    // Get unique sportsnode 
    const sportFilter = document.getElementById('sportFilter');
    if (!sportFilter) return;
    
    sportFilter.innerHTML = '<option value="">All Sports</option>';
    const sports = [...new Set(events.map(event => event.sport_type))];
    sports.forEach(sport => {
        const option = document.createElement('option');
        option.value = sport;
        option.textContent = sport;
        sportFilter.appendChild(option);
    });
    
    // Get unique locations (cities)
    const locationFilter = document.getElementById('locationFilter');
    if (!locationFilter) return;
    
    locationFilter.innerHTML = '<option value="">All Locations</option>';
    const locations = [...new Set(events.map(event => event.city))];
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationFilter.appendChild(option);
    });
}

// Set up event handlers for calendar navigation and filters
function setupFilterHandlers(allEvents, joinedEventIds) {
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const showJoinedEventsCheckbox = document.getElementById('showJoinedEvents');
    
    if (!prevMonthBtn || !nextMonthBtn || !applyFiltersBtn || !showJoinedEventsCheckbox) {
        console.error('Calendar control elements not found');
        return;
    }
    
    // Ensure checkbox is unchecked by default
    showJoinedEventsCheckbox.checked = false;
    
    let currentDate = new Date();
    
    // Update month display
    updateMonthYearDisplay(currentDate);
    
    // Previous month button
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateMonthYearDisplay(currentDate);
        applyFiltersAndRender(currentDate, allEvents, joinedEventIds);
    });
    
    // Next month button
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateMonthYearDisplay(currentDate);
        applyFiltersAndRender(currentDate, allEvents, joinedEventIds);
    });
    
    // Apply filters button
    applyFiltersBtn.addEventListener('click', () => {
        applyFiltersAndRender(currentDate, allEvents, joinedEventIds);
    });
}

// Update the month and year display
function updateMonthYearDisplay(date) {
    const monthYearElement = document.getElementById('currentMonthYear');
    if (!monthYearElement) return;
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    monthYearElement.textContent = monthYear;
}

// Apply filters and render calendar
function applyFiltersAndRender(date, allEvents, joinedEventIds) {
    const showOnlyJoined = document.getElementById('showJoinedEvents');
    const sportFilter = document.getElementById('sportFilter');
    const timeFilter = document.getElementById('timeFilter');
    const locationFilter = document.getElementById('locationFilter');
    
    if (!showOnlyJoined || !sportFilter || !timeFilter || !locationFilter) {
        console.error('Filter elements not found');
        return;
    }
    
    // Get filter values
    const showOnlyJoinedValue = showOnlyJoined.checked;
    const sportValue = sportFilter.value;
    const timeValue = timeFilter.value;
    const locationValue = locationFilter.value;
    
    // Filter events
    let filteredEvents = [...allEvents];
    
    // Filter by joined events
    if (showOnlyJoinedValue) {
        filteredEvents = filteredEvents.filter(event => joinedEventIds.includes(event.event_id));
    }
    
    // Filter by sport
    if (sportValue) {
        filteredEvents = filteredEvents.filter(event => event.sport_type === sportValue);
    }
    
    // Filter by location
    if (locationValue) {
        filteredEvents = filteredEvents.filter(event => event.city === locationValue);
    }
    
    // Filter by time period
    if (timeValue !== 'all') {
        const now = new Date();
        
        switch (timeValue) {
            case 'today':
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                filteredEvents = filteredEvents.filter(event => {
                    const eventDate = new Date(event.event_date);
                    return eventDate >= todayStart && eventDate < todayEnd;
                });
                break;
                
            case 'thisWeek':
                // Start of this week (Sunday)
                const thisWeekStart = new Date(now);
                thisWeekStart.setDate(now.getDate() - now.getDay());
                thisWeekStart.setHours(0, 0, 0, 0);
                
                // End of this week (Saturday)
                const thisWeekEnd = new Date(thisWeekStart);
                thisWeekEnd.setDate(thisWeekStart.getDate() + 7);
                
                filteredEvents = filteredEvents.filter(event => {
                    const eventDate = new Date(event.event_date);
                    return eventDate >= thisWeekStart && eventDate < thisWeekEnd;
                });
                break;
                
            case 'thisMonth':
                // Start/end of this month
                const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                
                filteredEvents = filteredEvents.filter(event => {
                    const eventDate = new Date(event.event_date);
                    return eventDate >= thisMonthStart && eventDate <= thisMonthEnd;
                });
                break;
                
            case 'nextMonth':
                // Start/end of next month
                const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
                
                filteredEvents = filteredEvents.filter(event => {
                    const eventDate = new Date(event.event_date);
                    return eventDate >= nextMonthStart && eventDate <= nextMonthEnd;
                });
                break;
        }
    }
    
    // Render the calendar with filtered events
    renderCalendar(date, filteredEvents, joinedEventIds);
}

// Render the calendar grid
function renderCalendar(date, events, joinedEventIds) {
    const calendarElement = document.getElementById('calendar');
    if (!calendarElement) {
        console.error('Calendar element not found');
        return;
    }
    
    calendarElement.innerHTML = '';
    
    // Create calendar table
    const calendarTable = document.createElement('table');
    calendarTable.className = 'calendar-table';
    
    // Create header row with day names
    const headerRow = document.createElement('tr');
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        headerRow.appendChild(th);
    });
    calendarTable.appendChild(headerRow);
    
    // Get first day of month and last day of month
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    
    // Calculate the first calendar day (might be in the previous month)
    const firstCalendarDay = new Date(firstDay);
    firstCalendarDay.setDate(firstDay.getDate() - firstDay.getDay());
    
    // Create calendar rows
    let currentDay = new Date(firstCalendarDay);
    
    // Create 6 rows to ensure we have enough space for all month configurations
    for (let weekRow = 0; weekRow < 6; weekRow++) {
        const row = document.createElement('tr');
        
        // Create 7 days for each row
        for (let dayCol = 0; dayCol < 7; dayCol++) {
            const cell = document.createElement('td');
            
            // Check if the day is in the current month
            const isCurrentMonth = currentDay.getMonth() === date.getMonth();
            
            // Add an id to the cell for the date
            const dateString = currentDay.toISOString().split('T')[0];
            cell.id = `date-${dateString}`;
            cell.className = 'calendar-cell';
            if (!isCurrentMonth) {
                cell.classList.add('other-month');
            }
            
            // Create date number
            const dateDiv = document.createElement('div');
            dateDiv.className = 'date-number';
            dateDiv.textContent = currentDay.getDate();
            cell.appendChild(dateDiv);
            
            // Create events container for this day
            const eventsDiv = document.createElement('div');
            eventsDiv.className = 'day-events';
            
            // Find events for this day
            const dayEvents = events.filter(event => {
                const eventDate = new Date(event.event_date);
                return eventDate.getFullYear() === currentDay.getFullYear() &&
                       eventDate.getMonth() === currentDay.getMonth() &&
                       eventDate.getDate() === currentDay.getDate();
            });
            
            // Add events to the day cell
            // Modify the calendar event creation code in renderCalendar()

            if (dayEvents.length > 0) {
                dayEvents.forEach(event => {
                    const eventDiv = document.createElement('div');
                    eventDiv.className = 'calendar-event';
                    
                    // Color code if user joined or not
                    if (joinedEventIds.includes(event.event_id)) {
                        eventDiv.classList.add('joined-event');
                    }
                    
                    // Check if event has passed
                    const eventDate = new Date(event.event_date);
                    const currentDate = new Date();
                    const isPastEvent = eventDate < currentDate;
                    
                    if (isPastEvent) {
                        eventDiv.classList.add('past-event');
                    }
                    
                    // Format time
                    const timeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    eventDiv.innerHTML = `
                        <strong>${event.event_name}</strong> ${timeStr}<br>
                        <span class="event-sport">${event.sport_type}</span>
                    `;
                    
                    // Only add click handler if event hasn't passed
                    if (!isPastEvent) {
                        eventDiv.addEventListener('click', () => showEventDetails(event, joinedEventIds.includes(event.event_id)));
                    } else {
                        // For past events, show a different message or behavior when clicked
                        eventDiv.addEventListener('click', () => {
                            alert('This event has already passed.');
                        });
                        
                        // Optional: change cursor style to indicate it's not fully interactive
                        eventDiv.style.cursor = 'default';
                    }
                    
                    eventsDiv.appendChild(eventDiv);
                });
            }
            
            cell.appendChild(eventsDiv);
            row.appendChild(cell);
            
            // Move to the next day
            currentDay.setDate(currentDay.getDate() + 1);
        }
        
        calendarTable.appendChild(row);
        
        // If we've passed the end of the month and completed the row, we can stop
        if (currentDay.getMonth() !== date.getMonth() && currentDay.getDay() === 0) {
            break;
        }
    }
    
    calendarElement.appendChild(calendarTable);
}

// Show event details in a modal
// Show event details in a modal
function showEventDetails(event, hasJoined) {
    // Check if the modal already exists and remove it
    const existingModal = document.getElementById('eventDetailModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create a modal for event details
    const modalHTML = `
        <div id="eventDetailModal" class="modal-container" style="display: flex;">
            <div class="modal-content">
                <span class="close-button" id="closeEventDetail">&times;</span>
                <h2>${event.event_name}</h2>
                <div class="event-details">
                    <p><strong>Sport:</strong> ${event.sport_type}</p>
                    <p><strong>Date:</strong> ${new Date(event.event_date).toLocaleString()}</p>
                    <p><strong>Location:</strong> ${event.city}</p>
                    <p><strong>Created by:</strong> ${event.creator_name || 'Unknown'}</p>
                    
                    ${event.player_list ? `<div id="invitedPlayersSection">
                        <h3>Invited Players</h3>
                        <p>${event.player_list}</p>
                    </div>` : ''}
                    
                    <div id="eventParticipants">
                        <h3>Joined Participants</h3>
                        <div id="participantsList">Loading participants...</div>
                    </div>
                    
                    ${!hasJoined ? 
                        `<button id="joinEventBtn" class="join-button" data-event-id="${event.event_id}">Join Event</button>` :
                        '<button class="join-button joined" disabled>Joined</button>'
                    }
                </div>
            </div>
        </div>
    `;
    
    // Add the modal to the page
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Add event listeners
    document.getElementById('closeEventDetail').addEventListener('click', () => {
        document.getElementById('eventDetailModal').remove();
    });
    
    // Join event button
    const joinButton = document.getElementById('joinEventBtn');
    if (joinButton) {
        joinButton.addEventListener('click', async (e) => {
            await handleJoinEvent(e);
            document.getElementById('eventDetailModal').remove();
            
            // FIXED: Don't use loadCalendar directly to avoid recursion
            // Instead, manually refresh the calendar
            try {
                const events = await DataModel.getEvents();
                const joinedEvents = await DataModel.getJoinedEvents();
                const joinedEventIds = joinedEvents.map(event => event.event_id);
                
                // Just re-render without reloading everything
                renderCalendar(new Date(), events, joinedEventIds);
            } catch (error) {
                console.error('Error refreshing calendar:', error);
            }
        });
    }
    
    // Load participants
    loadEventParticipants(event.event_id);
}

// Load event participants
async function loadEventParticipants(eventId) {
    const participantsElement = document.getElementById('participantsList');
    if (!participantsElement) return;
    
    try {
        // Get event participants using the DataModel
        const participants = await DataModel.getEventParticipants(eventId);
        
        if (!participants || participants.length === 0) {
            participantsElement.innerHTML = '<p>No joined participants yet</p>';
            return;
        }
        
        // Display participants
        const participantsList = document.createElement('ul');
        participantsList.className = 'participants-list';
        
        participants.forEach(participant => {
            const li = document.createElement('li');
            li.textContent = participant.username;
            participantsList.appendChild(li);
        });
        
        participantsElement.innerHTML = '';
        participantsElement.appendChild(participantsList);
    } catch (error) {
        console.error('Error loading participants:', error);
        participantsElement.innerHTML = '<p>Error loading participants</p>';
    }
}

// Handle join event button clicks - reusing the function from dashboard.js
async function handleJoinEvent(e) {
    const eventId = e.target.dataset.eventId;
    
    try {
        const result = await DataModel.joinEvent(eventId);
        if (result && result.success) {
            // Update button to show joined status
            e.target.textContent = 'Joined';
            e.target.classList.add('joined');
            e.target.disabled = true;
            
            alert('You have successfully joined the event!');
        } else {
            alert('Failed to join event. Please try again.');
        }
    } catch (error) {
        console.error('Error joining event:', error);
        alert('An error occurred while joining the event.');
    }
}

// Expose the loadCalendar function globally so it can be used in dashboard.js
window.initializeCalendar = loadCalendar;