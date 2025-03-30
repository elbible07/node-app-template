// eventsTable.js - Handles all events table functionality

// Class for managing the events table
class EventsTable {
    constructor() {
        // Table elements
        this.tableBody = document.getElementById('events-table-body');
        this.sportFilter = document.getElementById('sportFilterTable');
        this.locationFilter = document.getElementById('locationFilterTable');
        this.applyFiltersBtn = document.getElementById('applyTableFilters');
        this.selectAllCheckbox = document.getElementById('select-all-events');
        
        // Pagination elements
        this.paginationNumbers = document.getElementById('pagination-numbers');
        this.firstPageBtn = document.getElementById('first-page');
        this.prevPageBtn = document.getElementById('prev-page');
        this.nextPageBtn = document.getElementById('next-page');
        this.lastPageBtn = document.getElementById('last-page');
        this.eventsPerPageSelect = document.getElementById('events-per-page');
        
        // Events data
        this.allEvents = [];
        this.filteredEvents = [];
        this.joinedEventIds = [];
        
        // Pagination state
        this.currentPage = 1;
        this.eventsPerPage = parseInt(this.eventsPerPageSelect.value);
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    // Initialize event listeners
    initEventListeners() {
        // Filter button
        if (this.applyFiltersBtn) {
            this.applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        }
        
        // Select all checkbox
        if (this.selectAllCheckbox) {
            this.selectAllCheckbox.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
        }
        
        // Pagination controls
        if (this.firstPageBtn) {
            this.firstPageBtn.addEventListener('click', () => this.goToPage(1));
        }
        
        if (this.prevPageBtn) {
            this.prevPageBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        }
        
        if (this.nextPageBtn) {
            this.nextPageBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        }
        
        if (this.lastPageBtn) {
            this.lastPageBtn.addEventListener('click', () => this.goToPage(this.getTotalPages()));
        }
        
        // Events per page select
        // Events per page select
        if (this.eventsPerPageSelect) {
        this.eventsPerPageSelect.addEventListener('change', () => {
        console.log('Events per page changed to', this.eventsPerPageSelect.value);
        this.eventsPerPage = parseInt(this.eventsPerPageSelect.value);
        
        // Force a re-render regardless of current page
        this.currentPage = 1;
        this.renderTable();
        this.updatePaginationControls();
        
        console.log('Table re-rendered with new events per page setting');
    });
}
        // Refresh button
        const refreshBtn = document.getElementById('refreshEvents');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadEvents());
        }
        
        // Download button (placeholder functionality)
        const downloadBtn = document.getElementById('downloadEvents');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                alert('Download functionality will be implemented in a future update.');
            });
        }
    }
    
    // Load events data
    async loadEvents() {
        if (!this.tableBody) {
            console.error('Table body element not found');
            return;
        }
        
        this.tableBody.innerHTML = '<tr><td colspan="10" class="loading-message">Loading events...</td></tr>';
        
        try {
            // Fetch all events using the DataModel
            this.allEvents = await DataModel.getEvents();
            
            // Also fetch joined events to know which ones the user has already joined
            const joinedEvents = await DataModel.getJoinedEvents();
            this.joinedEventIds = joinedEvents.map(event => event.event_id);
            
            // Populate filters with unique values
            this.populateFilters();
            
            // Set filtered events to all events initially
            this.filteredEvents = [...this.allEvents];
            
            // Render the table with the events
            this.renderTable();
        } catch (error) {
            console.error('Error loading events:', error);
            this.tableBody.innerHTML = '<tr><td colspan="10" class="error-message">Failed to load events. Please try again later.</td></tr>';
        }
    }
    
    // Populate filter dropdowns with unique values
    populateFilters() {
        // Clear existing options except the first one
        while (this.sportFilter.options.length > 1) {
            this.sportFilter.remove(1);
        }
        
        while (this.locationFilter.options.length > 1) {
            this.locationFilter.remove(1);
        }
        
        // Get unique sports
        const sports = [...new Set(this.allEvents.map(event => event.sport_type))];
        sports.forEach(sport => {
            const option = document.createElement('option');
            option.value = sport;
            option.textContent = sport;
            this.sportFilter.appendChild(option);
        });
        
        // Get unique locations (cities)
        const locations = [...new Set(this.allEvents.map(event => event.city))];
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            this.locationFilter.appendChild(option);
        });
    }
    
    // Apply filters to the events
    applyFilters() {
    console.log('applyFilters called in EventsTable class');
    const sportValue = this.sportFilter.value;
    const locationValue = this.locationFilter.value;
    
    console.log('Filter values:', { sport: sportValue, location: locationValue });
    
    // Close any open action menus
    const existingMenus = document.querySelectorAll('.action-menu');
    existingMenus.forEach(menu => {
        if (document.body.contains(menu)) {
            document.body.removeChild(menu);
        }
    });
    
    // Start with all events
    this.filteredEvents = [...this.allEvents];
    console.log('All events count:', this.allEvents.length);
    
    // Filter by sport
    if (sportValue) {
        this.filteredEvents = this.filteredEvents.filter(event => event.sport_type === sportValue);
        console.log('After sport filter count:', this.filteredEvents.length);
    }
    
    // Filter by location
    if (locationValue) {
        this.filteredEvents = this.filteredEvents.filter(event => event.city === locationValue);
        console.log('After location filter count:', this.filteredEvents.length);
    }
    
    // Reset to first page and render
    this.currentPage = 1;
    console.log('Rendering table with filtered events');
    this.renderTable();
}
    // Render the events table
    renderTable() {
        if (!this.tableBody) return;
        
        if (this.filteredEvents.length === 0) {
            this.tableBody.innerHTML = '<tr><td colspan="10" class="no-data-message">No events found matching your criteria.</td></tr>';
            this.updatePaginationControls();
            return;
        }
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.eventsPerPage;
        const endIndex = Math.min(startIndex + this.eventsPerPage, this.filteredEvents.length);
        const eventsToShow = this.filteredEvents.slice(startIndex, endIndex);
        
        // Clear the table body
        this.tableBody.innerHTML = '';
        
        // Add events to table
        eventsToShow.forEach(event => {
            const hasJoined = this.joinedEventIds.includes(event.event_id);
            
            const row = document.createElement('tr');
            
            // Parse the event date for formatting
            const eventDate = new Date(event.event_date);
            const dateFormatted = eventDate.toLocaleDateString();
            const timeFormatted = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Create status badge text
            let statusText = hasJoined ? 'Joined' : 'Available';
            let statusClass = hasJoined ? 'joined' : 'available';
            
            // Check if event is full (simplified logic - you might have more complex logic)
            const playerList = event.player_list ? event.player_list.split(',').length : 0;
            if (playerList >= 10 && !hasJoined) { // Assuming max 10 players
                statusText = 'Full';
                statusClass = 'full';
            }

            const currentDate = new Date();
            if (eventDate < currentDate) {
                statusText = 'Passed';
                statusClass = 'passed';
            }
            
            row.innerHTML = `
                <td class="checkbox-cell">
                    <div class="table-cell">
                        <input type="checkbox" id="event-${event.event_id}" class="event-checkbox" 
                               data-event-id="${event.event_id}" ${hasJoined ? 'checked' : ''} 
                               aria-label="Select ${event.event_name}">
                    </div>
                </td>
                <td class="event-name-cell">
                    <div class="table-cell">${event.event_name}</div>
                </td>
                <td class="sport-cell">
                    <div class="table-cell">${event.sport_type}</div>
                </td>
                <td class="date-cell">
                    <div class="table-cell">${dateFormatted}</div>
                </td>
                <td class="time-cell">
                    <div class="table-cell">${timeFormatted}</div>
                </td>
                <td class="location-cell">
                    <div class="table-cell">${event.city}</div>
                </td>
                <td class="creator-cell">
                    <div class="table-cell">${event.creator_name || 'Unknown'}</div>
                </td>
                <td class="players-cell">
                    <div class="table-cell">${event.player_list || 'None'}</div>
                </td>
                <td class="status-cell">
                    <div class="table-cell">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                </td>
                <td class="action-cell">
                    <div class="table-cell">
                        <button class="action-button-cell" data-event-id="${event.event_id}" aria-label="More actions">
                            <i class="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                    </div>
                </td>
            `;
            
            // Add event listeners for the row
            const checkbox = row.querySelector('.event-checkbox');
            if (checkbox) {
                checkbox.addEventListener('change', (e) => this.handleCheckboxChange(e.target));
            }
            
            const actionButton = row.querySelector('.action-button-cell');
            if (actionButton) {
                actionButton.addEventListener('click', (e) => this.handleActionButtonClick(e, event));
            }
            
            // Add row to table
            this.tableBody.appendChild(row);
        });
        
        // Update pagination controls
        this.updatePaginationControls();
    }
    
    // Update the pagination controls
    updatePaginationControls() {
        // Clear existing page numbers
        this.paginationNumbers.innerHTML = '';
        
        const totalPages = this.getTotalPages();
        
        // Disable/enable first and previous buttons
        this.firstPageBtn.disabled = this.currentPage === 1;
        this.prevPageBtn.disabled = this.currentPage === 1;
        
        // Disable/enable next and last buttons
        this.nextPageBtn.disabled = this.currentPage === totalPages || totalPages === 0;
        this.lastPageBtn.disabled = this.currentPage === totalPages || totalPages === 0;
        
        // If no pages, don't show pagination numbers
        if (totalPages === 0) return;
        
        // Create page number buttons
        this.createPaginationNumbers(totalPages);
    }
    
    // Create pagination number buttons
    createPaginationNumbers(totalPages) {
        // Determine which page numbers to show
        let startPage = Math.max(1, this.currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        // Adjust start page if we're near the end
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        // Add first page if not included
        if (startPage > 1) {
            this.addPageNumber(1);
            
            // Add ellipsis if there's a gap
            if (startPage > 2) {
                this.addEllipsis();
            }
        }
        
        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            this.addPageNumber(i);
        }
        
        // Add last page if not included
        if (endPage < totalPages) {
            // Add ellipsis if there's a gap
            if (endPage < totalPages - 1) {
                this.addEllipsis();
            }
            
            this.addPageNumber(totalPages);
        }
    }
    
    // Add a page number button
    addPageNumber(pageNum) {
        const pageButton = document.createElement('button');
        pageButton.className = 'page-number' + (pageNum === this.currentPage ? ' active' : '');
        pageButton.textContent = pageNum;
        pageButton.setAttribute('aria-label', `Page ${pageNum}`);
        if (pageNum === this.currentPage) {
            pageButton.setAttribute('aria-current', 'page');
        }
        
        pageButton.addEventListener('click', () => this.goToPage(pageNum));
        
        this.paginationNumbers.appendChild(pageButton);
    }
    
    // Add ellipsis
    addEllipsis() {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'page-ellipsis';
        ellipsis.textContent = '...';
        ellipsis.setAttribute('aria-hidden', 'true');
        
        this.paginationNumbers.appendChild(ellipsis);
    }
    
    // Get total number of pages
    getTotalPages() {
        return Math.ceil(this.filteredEvents.length / this.eventsPerPage);
    }
    
    // Go to specific page
    goToPage(pageNum) {
        const totalPages = this.getTotalPages();
        
        // Validate page number
        if (pageNum < 1 || pageNum > totalPages || pageNum === this.currentPage) {
            return;
        }
        
        this.currentPage = pageNum;
        this.renderTable();
    }
    
    // Toggle select all checkboxes
    toggleSelectAll(checked) {
        const checkboxes = this.tableBody.querySelectorAll('.event-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
    }
    
    // Handle individual checkbox changes
    handleCheckboxChange(checkbox) {
        const eventId = checkbox.dataset.eventId;
        const isChecked = checkbox.checked;
        
        console.log(`Event ${eventId} checkbox changed to ${isChecked}`);
        
        // If an unchecked box is checked, join the event
        if (isChecked && !this.joinedEventIds.includes(parseInt(eventId))) {
            this.joinEvent(eventId);
        }
        
        // Update the "select all" checkbox
        this.updateSelectAllCheckbox();
    }
    
    // Update the state of the "select all" checkbox
    updateSelectAllCheckbox() {
        const checkboxes = this.tableBody.querySelectorAll('.event-checkbox');
        const checkedBoxes = this.tableBody.querySelectorAll('.event-checkbox:checked');
        
        if (checkboxes.length > 0) {
            this.selectAllCheckbox.checked = checkedBoxes.length === checkboxes.length;
            this.selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < checkboxes.length;
        }
    }
    
    // Handle action button click
    handleActionButtonClick(e, event) {
        e.stopPropagation(); // Prevent event bubbling
        
        // Create a dropdown menu
        const actionMenu = document.createElement('div');
        actionMenu.className = 'action-menu';
        actionMenu.style.position = 'absolute';
        actionMenu.style.right = '20px';
        actionMenu.style.backgroundColor = 'white';
        actionMenu.style.border = '1px solid #e0e0e0';
        actionMenu.style.borderRadius = '8px';
        actionMenu.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        actionMenu.style.zIndex = '1000';
        actionMenu.style.width = '150px';
        
        // Calculate position
        const buttonRect = e.target.getBoundingClientRect();
        actionMenu.style.top = `${buttonRect.bottom + window.scrollY + 5}px`;
        
        // Menu items
        const hasJoined = this.joinedEventIds.includes(event.event_id);
        
        // Create menu items
        const menuItems = [
            {
                text: 'View Details',
                icon: 'fa-solid fa-eye',
                action: () => this.viewEventDetails(event)
            },
            {
                text: hasJoined ? 'Already Joined' : 'Join Event',
                icon: hasJoined ? 'fa-solid fa-check' : 'fa-solid fa-user-plus',
                action: () => this.joinEvent(event.event_id),
                disabled: hasJoined
            },
            {
                text: 'Share Event',
                icon: 'fa-solid fa-share-nodes',
                action: () => this.shareEvent(event)
            }
        ];
        
        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'action-menu-item';
            menuItem.style.padding = '10px 16px';
            menuItem.style.cursor = item.disabled ? 'default' : 'pointer';
            menuItem.style.display = 'flex';
            menuItem.style.alignItems = 'center';
            menuItem.style.gap = '8px';
            menuItem.style.color = item.disabled ? '#aaa' : '#121212';
            
            menuItem.innerHTML = `
                <i class="${item.icon}" style="width: 16px;"></i>
                <span>${item.text}</span>
            `;
            
            if (!item.disabled) {
                menuItem.addEventListener('click', () => {
                    document.body.removeChild(actionMenu);
                    item.action();
                });
                
                menuItem.addEventListener('mouseover', () => {
                    menuItem.style.backgroundColor = '#f5f5f5';
                });
                
                menuItem.addEventListener('mouseout', () => {
                    menuItem.style.backgroundColor = 'transparent';
                });
            }
            
            actionMenu.appendChild(menuItem);
            
            // Add separator (except for the last item)
            if (item !== menuItems[menuItems.length - 1]) {
                const separator = document.createElement('div');
                separator.style.height = '1px';
                separator.style.backgroundColor = '#e0e0e0';
                separator.style.margin = '0 16px';
                actionMenu.appendChild(separator);
            }
        });
        
        // Add to document
        document.body.appendChild(actionMenu);
        
        // Close menu when clicking elsewhere
        const closeMenu = (e) => {
            // Check if the menu is still in the document before removing
            if (!actionMenu.contains(e.target) && e.target !== actionMenu && document.body.contains(actionMenu)) {
                document.body.removeChild(actionMenu);
                document.removeEventListener('click', closeMenu);
            }
        };
        
        // Delay adding the event listener to prevent immediate closing
        setTimeout(() => {
            // Check if the menu is still in the document before adding listener
            if (document.body.contains(actionMenu)) {
                document.addEventListener('click', closeMenu);
            }
        }, 100);
    }
    
    // View event details
    viewEventDetails(event) {
        // Show event details in a modal
        const hasJoined = this.joinedEventIds.includes(event.event_id);
        
        // Check if the modal already exists and remove it
        const existingModal = document.getElementById('eventDetailModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Parse the event date for formatting
        const eventDate = new Date(event.event_date);
        const dateFormatted = eventDate.toLocaleDateString();
        const timeFormatted = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Create a modal for event details
        const modalHTML = `
            <div id="eventDetailModal" class="modal-container" style="display: flex;">
                <div class="modal-content">
                    <span class="close-button" id="closeEventDetail">&times;</span>
                    <h2>${event.event_name}</h2>
                    <div class="event-details">
                        <p><strong>Sport:</strong> ${event.sport_type}</p>
                        <p><strong>Date:</strong> ${dateFormatted} at ${timeFormatted}</p>
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
            joinButton.addEventListener('click', async () => {
                await this.joinEvent(event.event_id);
                document.getElementById('eventDetailModal').remove();
            });
        }
        
        // Load participants
        this.loadEventParticipants(event.event_id);
    }
    
    // Load event participants
    async loadEventParticipants(eventId) {
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
    
    // Join an event
    async joinEvent(eventId) {
        try {
            const result = await DataModel.joinEvent(eventId);
            if (result && result.success) {
                // Add the event ID to joined events
                if (!this.joinedEventIds.includes(parseInt(eventId))) {
                    this.joinedEventIds.push(parseInt(eventId));
                }
                
                // Update the table to reflect the change
                this.renderTable();
                
                alert('You have successfully joined the event!');
            } else {
                alert('Failed to join event. Please try again.');
            }
        } catch (error) {
            console.error('Error joining event:', error);
            alert('An error occurred while joining the event.');
        }
    }
    
    // Share event (placeholder function)
    shareEvent(event) {
        // This would be implemented with actual sharing functionality
        alert(`Share functionality for "${event.event_name}" will be implemented in a future update.`);
    }
}

// Initialize the events table when the page loads
function initEventsTable() {
    console.log('Initializing events table');
    const eventsTable = new EventsTable();
    eventsTable.loadEvents();
    
    // Store the instance globally for reference
    window.eventsTable = eventsTable;
}

// Expose the initialization function globally
window.initEventsTable = initEventsTable;