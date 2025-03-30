//dashboard.js
////////////////////////////////////////////////////////////////
//DASHBOARD.JS
//THIS IS YOUR "CONTROLLER", IT ACTS AS THE MIDDLEMAN
// BETWEEN THE MODEL (datamodel.js) AND THE VIEW (dashboard.html)
////////////////////////////////////////////////////////////////


//ADD ALL EVENT LISTENERS INSIDE DOMCONTENTLOADED
//AT THE BOTTOM OF DOMCONTENTLOADED, ADD ANY CODE THAT NEEDS TO RUN IMMEDIATELY
document.addEventListener('DOMContentLoaded', () => {
    
    //////////////////////////////////////////
    //ELEMENTS TO ATTACH EVENT LISTENERS
    //////////////////////////////////////////
    const logoutButton = document.getElementById('logoutButton');
    const refreshButton = document.getElementById('refreshButton');
    const listUsersButton = document.getElementById('listUsersButton');
    const tabButtons = document.querySelectorAll('.menu-link[data-tab]');
   
    // Create Event button is now part of the new layout
    const createEventButton = document.getElementById('createEventButton');

    // Get modal container
    const modalContainer = document.getElementById('eventModalContainer');
    //////////////////////////////////////////
    //END ELEMENTS TO ATTACH EVENT LISTENERS
    //////////////////////////////////////////


    //////////////////////////////////////////
    //EVENT LISTENERS
    //////////////////////////////////////////
    // Add event listener for Create Event button
    if (createEventButton) {
        createEventButton.addEventListener('click', () => {
            modalContainer.style.display = 'flex';
        });
    }

    // Close the modal when clicking the close button
    document.querySelector('.close-button').addEventListener('click', () => {
        modalContainer.style.display = 'none';
    });

    // Close the modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === modalContainer) {
            modalContainer.style.display = 'none';
        }
    });

    // Handle event form submission
    document.getElementById('createEventForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const eventData = {
            event_name: document.getElementById('eventName').value,
            sport_type: document.getElementById('sportType').value,
            event_date: document.getElementById('eventDate').value,
            city: document.getElementById('eventCity').value,
            player_list: document.getElementById('playerList').value
        };
        
        try {
            const result = await DataModel.createEvent(eventData);
            if (result && result.success) {
                alert('Event created successfully!');
                modalContainer.style.display = 'none';
                // Refresh the events list
                const activeTab = document.querySelector('.menu-item.active .menu-link');
                if (activeTab && activeTab.getAttribute('data-tab') === 'events') {
                    await loadEvents();
                }
                // Reset form
                document.getElementById('createEventForm').reset();
            } else {
                alert('Failed to create event. Please try again.');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            alert('An error occurred while creating the event.');
        }
    });

    // Handle the send invite button (currently just a placeholder)
    document.getElementById('sendInviteButton').addEventListener('click', () => {
        alert('Invite functionality will be implemented in a future update.');
    });

    // Log out and redirect to login
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Clear all authentication data
            localStorage.removeItem('jwtToken');
            
            // Force redirect to login page, preventing back navigation
            window.location.replace('/');
            
            // For extra security, return false to prevent default action
            return false;
        });
    }

    // Refresh list when the button is clicked
    if (refreshButton) {
        refreshButton.addEventListener('click', async () => {
            // Refresh the currently active tab
            const activeMenuItem = document.querySelector('.menu-item.active');
            if (activeMenuItem) {
                const activeLink = activeMenuItem.querySelector('.menu-link');
                if (activeLink) {
                    switchTab(activeLink.getAttribute('data-tab'));
                }
            }
        });
    }

    // List Users button click event
    if (listUsersButton) {
        listUsersButton.addEventListener('click', async () => {
            console.log('List Users button clicked');
            try {
                await renderUserList();
                
                // Update the active tab in the sidebar
                tabButtons.forEach(button => {
                    const menuItem = button.closest('.menu-item');
                    const iconContainer = button.querySelector('.icon-container');
                    
                    if (button.getAttribute('data-tab') === 'users') {
                        menuItem.classList.add('active');
                        if (iconContainer) iconContainer.classList.add('active-icon');
                    } else {
                        menuItem.classList.remove('active');
                        if (iconContainer) iconContainer.classList.remove('active-icon');
                    }
                });
            } catch (error) {
                console.error('Error rendering user list:', error);
            }
        });
    }

    // Tab switching event listener for sidebar menu
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all menu items
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Remove active class from all icon containers
            document.querySelectorAll('.icon-container').forEach(icon => {
                icon.classList.remove('active-icon');
            });
            
            // Add active class to clicked menu item
            const menuItem = button.closest('.menu-item');
            if (menuItem) {
                menuItem.classList.add('active');
            }
            
            // Add active class to icon container
            const iconContainer = button.querySelector('.icon-container');
            if (iconContainer) {
                iconContainer.classList.add('active-icon');
            }
            
            // Hide all tab panes
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            // Show the selected tab pane
            const tabId = button.getAttribute('data-tab');
            const tabPane = document.getElementById(`${tabId}-tab`);
            if (tabPane) {
                tabPane.classList.add('active');
            }
            
            // Load content for the tab
            switchTab(tabId);
        });
    });
    //////////////////////////////////////////
    //END EVENT LISTENERS
    //////////////////////////////////////////


    //////////////////////////////////////////////////////
    //CODE THAT NEEDS TO RUN IMMEDIATELY AFTER PAGE LOADS
    //////////////////////////////////////////////////////
    // Initial check for the token
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = '/';
    } else {
        DataModel.setToken(token);

        initTopNavigation('#top-nav-container', {
        quote: "Champions keep playing until they get it right.",
        tabSwitchFn: switchTab  // Your existing tab switching function
});
        
        // Find the active menu item
        const activeMenuItem = document.querySelector('.menu-item.active');
        if (activeMenuItem) {
            const activeLink = activeMenuItem.querySelector('.menu-link');
            if (activeLink && activeLink.getAttribute('data-tab')) {
                switchTab(activeLink.getAttribute('data-tab'));
            } else {
                // Default to events tab if no active tab
                switchTab('events');
            }
        } else {
            // Default to events tab if no active tab
            switchTab('events');
        }
    }
    //////////////////////////////////////////
    //END CODE THAT NEEDS TO RUN IMMEDIATELY AFTER PAGE LOADS
    //////////////////////////////////////////
});
//END OF DOMCONTENTLOADED


//////////////////////////////////////////
//FUNCTIONS TO MANIPULATE THE DOM
//////////////////////////////////////////
async function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    switch(tabName) {
        case 'events':
            await loadEvents();
            break;
        case 'calendar':
            await loadCalendar();
            break;
        case 'teams':
            await loadTeams();
            break;
        case 'profile':
            await loadProfile();
            break;
        case 'scorecard':
            await loadScorecard();
            break;
        case 'users':
            await renderUserList();
            break;
        default:
            console.error('Unknown tab:', tabName);
    }
}
async function renderUserList() {
    console.log('Rendering user list');
    const userListElement = document.getElementById('eventsList');
    
    // Ensure the element exists
    if (!userListElement) {
        console.error('User list element not found');
        return;
    }

    userListElement.innerHTML = '<div class="loading-message">Loading user list...</div>';
    
    try {
        const users = await DataModel.getUsers();
        console.log('Users retrieved:', users);
        
        // Clear previous content
        userListElement.innerHTML = '';
        
        // Check if users array is empty
        if (!users || users.length === 0) {
            userListElement.innerHTML = '<div class="user-item">No users found.</div>';
            return;
        }
        
        // Render each user
        users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.classList.add('user-item');
            userItem.textContent = user;
            userListElement.appendChild(userItem);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        userListElement.innerHTML = '<div class="user-item">Error loading users.</div>';
    }
}

async function loadEventsOriginal() {
    const eventsListElement = document.getElementById('eventsList');
    eventsListElement.innerHTML = '<div class="loading-message">Loading events...</div>';
    
    try {
        const events = await DataModel.getEvents();
        
        // Clear previous content
        eventsListElement.innerHTML = '';
        
        if (!events || events.length === 0) {
            eventsListElement.innerHTML = '<div class="no-events-message">No events found. Create a new event to get started!</div>';
            return;
        }
        
        // Display each event
        for (const event of events) {
            const eventDate = new Date(event.event_date);
            const formattedDate = eventDate.toLocaleString();
            
            // Check if user has already joined this event
            const hasJoined = await DataModel.checkEventJoined(event.event_id);
            
            const eventElement = document.createElement('div');
            eventElement.className = 'event-item';
            eventElement.innerHTML = `
                <h3>${event.event_name}</h3>
                <p><strong>Sport:</strong> ${event.sport_type}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Location:</strong> ${event.city}</p>
                <p><strong>Created by:</strong> ${event.creator_name || 'Unknown'}</p>
                ${event.player_list ? `<p><strong>Players:</strong> ${event.player_list}</p>` : ''}
                ${hasJoined 
                    ? '<button class="join-button joined" disabled>Joined</button>' 
                    : `<button class="join-button" data-event-id="${event.event_id}">Join Event</button>`
                }
            `;
            
            eventsListElement.appendChild(eventElement);
        }
        
        // Add event listeners to join buttons
        document.querySelectorAll('.join-button:not(.joined)').forEach(button => {
            button.addEventListener('click', handleJoinEvent);
        });
        
    } catch (error) {
        console.error('Error loading events:', error);
        eventsListElement.innerHTML = '<div class="error-message">Failed to load events. Please try again later.</div>';
    }
}

async function loadEvents() {
    // Check if we should use the table view or the original view
    const useTableView = true; // You can make this configurable later
    
    if (useTableView) {
        // Initialize and load the events table
        if (typeof window.initEventsTable === 'function') {
            window.initEventsTable();
        } else {
            console.error('Events table initialization function not found');
            // Fall back to the original view if the table can't be loaded
            loadEventsOriginal();
        }
    } else {
        // Use the original events view
        loadEventsOriginal();
    }
}

// Handle join event button clicks
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

// Update loadProfile function to show joined events
async function loadProfile() {
    const profileDetailsElement = document.getElementById('profileDetails');
    profileDetailsElement.innerHTML = '<div class="loading-message">Loading profile...</div>';
    
    try {
        const currentUser = await DataModel.getCurrentUser();
        if (currentUser) {
            let profileHTML = `
                <div class="profile-info">
                    <p><strong>Username:</strong> ${currentUser.username}</p>
                    <p><strong>Email:</strong> ${currentUser.email}</p>
                    <p><strong>Full Name:</strong> ${currentUser.fullName || 'Not provided'}</p>
                    <p><strong>City:</strong> ${currentUser.city || 'Not set'}</p>
                </div>
            `;
            
            // Add joined events section
            profileHTML += '<div class="joined-events"><h3>Events Joined</h3>';
            
            // Fetch joined events
            const joinedEvents = await DataModel.getJoinedEvents();
            
            if (joinedEvents && joinedEvents.length > 0) {
                profileHTML += '<ul class="event-list">';
                joinedEvents.forEach(event => {
                    const eventDate = new Date(event.event_date);
                    profileHTML += `
                        <li>
                            <strong>${event.event_name}</strong> - ${event.sport_type}
                            <br>Date: ${eventDate.toLocaleString()}
                            <br>Location: ${event.city}
                        </li>
                    `;
                });
                profileHTML += '</ul>';
            } else {
                profileHTML += '<p>You haven\'t joined any events yet.</p>';
            }
            
            profileHTML += '</div>';
            profileDetailsElement.innerHTML = profileHTML;
        } else {
            profileDetailsElement.innerHTML = 'Unable to load profile. Please try again.';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        profileDetailsElement.innerHTML = 'Error loading profile. Please try again.';
    }
}

// Let the calendar function be handled by calendarView.js
async function loadCalendar() {
    console.log('Dashboard loadCalendar');
    
    // Call the renamed global function from calendarView.js
    if (typeof window.initializeCalendar === 'function') {
        await window.initializeCalendar();
    } else {
        const calendarElement = document.getElementById('calendar');
        if (calendarElement) {
            calendarElement.innerHTML = '<div class="error-message">Calendar functionality not available.</div>';
        }
    }
}

async function loadTeams() {
    const teamsListElement = document.getElementById('teamsList');
    teamsListElement.innerHTML = '<div class="loading-message">Loading teams...</div>';
    // TODO: Implement actual teams loading logic
    teamsListElement.innerHTML = 'No teams found. Create or join a team!';
}

async function loadScorecard() {
    const scorecardDetailsElement = document.getElementById('scorecardDetails');
    scorecardDetailsElement.innerHTML = '<div class="loading-message">Loading scorecard...</div>';
    // TODO: Implement actual scorecard loading logic
    scorecardDetailsElement.innerHTML = 'No scorecard data available.';
}
//////////////////////////////////////////
//END FUNCTIONS TO MANIPULATE THE DOM
//////////////////////////////////////////