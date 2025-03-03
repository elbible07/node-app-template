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
    const tabButtons = document.querySelectorAll('.tab-button');
    //////////////////////////////////////////
    //END ELEMENTS TO ATTACH EVENT LISTENERS
    //////////////////////////////////////////


    //////////////////////////////////////////
    //EVENT LISTENERS
    //////////////////////////////////////////
    // Log out and redirect to login
    logoutButton.addEventListener('click', () => {
        // Clear all authentication data
        localStorage.removeItem('jwtToken');
        
        // Force redirect to login page, preventing back navigation
        window.location.replace('/');
        
        // For extra security, return false to prevent default action
        return false;
    });

    // Refresh list when the button is clicked
    refreshButton.addEventListener('click', async () => {
        // Refresh the currently active tab
        const activeTab = document.querySelector('.tab-button.active');
        if (activeTab) {
            switchTab(activeTab.dataset.tab);
        }
    });

    // List Users button click event
    listUsersButton.addEventListener('click', async () => {
        console.log('List Users button clicked');
        try {
            await renderUserList();
        } catch (error) {
            console.error('Error rendering user list:', error);
        }
    });

    // Tab switching event listener
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding tab
            button.classList.add('active');
            document.getElementById(`${button.dataset.tab}-tab`).classList.add('active');
            
            // Load content for the tab
            switchTab(button.dataset.tab);
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
        // Load initial tab (Events)
        switchTab('events');
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

async function loadEvents() {
    const eventsListElement = document.getElementById('eventsList');
    eventsListElement.innerHTML = '<div class="loading-message">Loading events...</div>';
    // TODO: Implement actual event loading logic
    eventsListElement.innerHTML = 'No events found. Check back later!';
}

async function loadTeams() {
    const teamsListElement = document.getElementById('teamsList');
    teamsListElement.innerHTML = '<div class="loading-message">Loading teams...</div>';
    // TODO: Implement actual teams loading logic
    teamsListElement.innerHTML = 'No teams found. Create or join a team!';
}

async function loadProfile() {
    const profileDetailsElement = document.getElementById('profileDetails');
    profileDetailsElement.innerHTML = '<div class="loading-message">Loading profile...</div>';
    
    try {
        const currentUser = await DataModel.getCurrentUser();
        if (currentUser) {
            profileDetailsElement.innerHTML = `
                <div class="profile-info">
                    <p><strong>Username:</strong> ${currentUser.username}</p>
                    <p><strong>Email:</strong> ${currentUser.email}</p>
                    <p><strong>Full Name:</strong> ${currentUser.full_name || 'Not provided'}</p>
                    <p><strong>City:</strong> ${currentUser.city || 'Not set'}</p>
                </div>
            `;
        } else {
            profileDetailsElement.innerHTML = 'Unable to load profile. Please try again.';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        profileDetailsElement.innerHTML = 'Error loading profile. Please try again.';
    }
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