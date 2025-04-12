/**
 * teams.js
 * Handles the teams functionality for the Sports Social App
 */

// Teams module using IIFE to avoid polluting global namespace
const TeamsModule = (function() {
    // Private variables
    let teamsList = [];
    let teamMembers = {};
    let currentFilter = 'all-teams'; // Default filter: 'my-teams' or 'all-teams'
    let currentSportFilter = '';
    let currentSearchQuery = '';
    
    // DOM Elements cache
    const domElements = {
        teamsContainer: null,
        teamsFilterSelect: null,
        sportFilterSelect: null,
        searchInput: null,
        createTeamButton: null,
        teamModal: null,
        teamForm: null,
        closeModalButton: null,
        teamDetailsModal: null
    };
    
    // Initialize the Teams module
    function init() {
        console.log('Initializing Teams Module');
        
        // Create or update the teams UI
        createTeamsUI();
        
        // Cache DOM elements
        cacheDOMElements();
        
        // Setup event listeners
        setupEventListeners();
        
        // Load Teams data (default: my teams)
        loadTeams();
    }
    
    // Create the Teams UI components
    function createTeamsUI() {
        const teamsTab = document.getElementById('teams-tab');
        if (!teamsTab) return;
        
        // Clear existing content
        teamsTab.innerHTML = '';
        
        // Create and append UI components
        teamsTab.innerHTML = `
            <div class="teams-header">
                <div class="teams-title">
                    <h2>Teams</h2>
                    <p>Join teams or create your own to connect with other players</p>
                </div>
                <div class="header-actions">
                    <button id="createTeamButton" class="action-button primary-button">
                        <i class="fa-solid fa-plus"></i> Create Team
                    </button>
                </div>
            </div>
            
            <div class="teams-filters">
                <div class="filter-group">
                    <label for="teamsFilterSelect">View:</label>
                    <select id="teamsFilterSelect" class="filter-select">
                        <option value="my-teams">All Teams</option>
                        <option value="all-teams">My Teams</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="sportFilterTeams">Sport:</label>
                    <select id="sportFilterTeams" class="filter-select">
                        <option value="">All Sports</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="searchTeams">Search:</label>
                    <input type="text" id="searchTeams" placeholder="Search teams...">
                </div>
                <button id="applyTeamsFilters" class="filter-button">
                    <i class="fa-solid fa-filter"></i> Apply Filters
                </button>
            </div>
            
            <div id="teamsContainer" class="teams-container">
                <div class="loading-message">Loading teams...</div>
            </div>
            
            <!-- Team Creation Modal -->
            <div id="teamModalContainer" class="modal-container">
                <div class="modal-content">
                    <span class="close-button" id="closeTeamModal">&times;</span>
                    <h2>Create New Team</h2>
                    <form id="createTeamForm">
                        <div class="form-group">
                            <label for="teamName">Team Name:</label>
                            <input type="text" id="teamName" required>
                        </div>
                        <div class="form-group">
                            <label for="teamSportType">Sport Type:</label>
                            <input type="text" id="teamSportType" required>
                        </div>
                        <div class="form-group">
                            <label for="teamCity">City:</label>
                            <input type="text" id="teamCity">
                        </div>
                        <div class="form-group">
                            <label for="teamDescription">Description:</label>
                            <textarea id="teamDescription" rows="3"></textarea>
                        </div>
                        <div class="button-group">
                            <button type="submit" id="submitTeamButton">Create Team</button>
                        </div>
                    </form>
                </div>
            </div>
            
            <!-- Team Details Modal -->
            <div id="teamDetailsModal" class="modal-container">
                <div class="modal-content team-details-modal">
                    <span class="close-button" id="closeTeamDetailsModal">&times;</span>
                    <div id="teamDetailsContent"></div>
                </div>
            </div>
        `;
    }
    
    // Cache frequently used DOM elements
    function cacheDOMElements() {
        domElements.teamsContainer = document.getElementById('teamsContainer');
        domElements.teamsFilterSelect = document.getElementById('teamsFilterSelect');
        domElements.sportFilterSelect = document.getElementById('sportFilterTeams');
        domElements.searchInput = document.getElementById('searchTeams');
        domElements.createTeamButton = document.getElementById('createTeamButton');
        domElements.teamModal = document.getElementById('teamModalContainer');
        domElements.teamForm = document.getElementById('createTeamForm');
        domElements.closeModalButton = document.getElementById('closeTeamModal');
        domElements.teamDetailsModal = document.getElementById('teamDetailsModal');
        domElements.applyFiltersButton = document.getElementById('applyTeamsFilters');
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Create team button click
        if (domElements.createTeamButton) {
            domElements.createTeamButton.addEventListener('click', () => {
                domElements.teamModal.style.display = 'flex';
            });
        }
        
        // Close team modal on X click
        if (domElements.closeModalButton) {
            domElements.closeModalButton.addEventListener('click', () => {
                domElements.teamModal.style.display = 'none';
            });
        }
        
        // Close modal on outside click
        window.addEventListener('click', (event) => {
            if (event.target === domElements.teamModal) {
                domElements.teamModal.style.display = 'none';
            }
            if (event.target === domElements.teamDetailsModal) {
                domElements.teamDetailsModal.style.display = 'none';
            }
        });
        
        // Close team details modal
        const closeTeamDetailsButton = document.getElementById('closeTeamDetailsModal');
        if (closeTeamDetailsButton) {
            closeTeamDetailsButton.addEventListener('click', () => {
                domElements.teamDetailsModal.style.display = 'none';
            });
        }
        
        // Create team form submission
        if (domElements.teamForm) {
            domElements.teamForm.addEventListener('submit', handleCreateTeam);
        }
        
        // Filter change event
        if (domElements.teamsFilterSelect) {
            domElements.teamsFilterSelect.addEventListener('change', (e) => {
                currentFilter = e.target.value;
            });
        }
        
        // Apply filters button
        if (domElements.applyFiltersButton) {
            domElements.applyFiltersButton.addEventListener('click', () => {
                currentSportFilter = domElements.sportFilterSelect.value;
                currentSearchQuery = domElements.searchInput.value.trim().toLowerCase();
                loadTeams();
            });
        }
    }
    
    // Load teams based on filters
    async function loadTeams() {
        if (!domElements.teamsContainer) return;
        
        domElements.teamsContainer.innerHTML = '<div class="loading-message">Loading teams...</div>';
        
        try {
            // Fetch teams based on filter
            let teams;
            if (currentFilter === 'my-teams') {
                teams = await DataModel.getMyTeams();
            } else {
                teams = await DataModel.getTeams();
            }
            
            // Store teams for filtering
            teamsList = teams;
            
            // Apply filters if set
            if (currentSportFilter || currentSearchQuery) {
                teams = teams.filter(team => {
                    const matchesSport = !currentSportFilter || team.sport_type === currentSportFilter;
                    const matchesSearch = !currentSearchQuery || 
                        team.team_name.toLowerCase().includes(currentSearchQuery) ||
                        team.description?.toLowerCase().includes(currentSearchQuery) ||
                        team.city?.toLowerCase().includes(currentSearchQuery);
                    
                    return matchesSport && matchesSearch;
                });
            }
            
            // Populate sport filter options if needed
            if (domElements.sportFilterSelect) {
                populateSportFilterOptions(teamsList);
            }
            
            // Render teams
            renderTeams(teams);
        } catch (error) {
            console.error('Error loading teams:', error);
            domElements.teamsContainer.innerHTML = '<div class="error-message">Error loading teams. Please try again.</div>';
        }
    }
    
    // Populate sport filter dropdown from available teams
    function populateSportFilterOptions(teams) {
        // Get unique sport types
        const sportTypes = [...new Set(teams.map(team => team.sport_type))];
        
        // Save current selection
        const currentSelection = domElements.sportFilterSelect.value;
        
        // Clear options except the first one (All Sports)
        const defaultOption = domElements.sportFilterSelect.options[0];
        domElements.sportFilterSelect.innerHTML = '';
        domElements.sportFilterSelect.appendChild(defaultOption);
        
        // Add sport options
        sportTypes.forEach(sport => {
            const option = document.createElement('option');
            option.value = sport;
            option.textContent = sport;
            domElements.sportFilterSelect.appendChild(option);
        });
        
        // Restore previous selection if it exists
        if (sportTypes.includes(currentSelection)) {
            domElements.sportFilterSelect.value = currentSelection;
        }
    }
    
    // Render teams to the container
    async function renderTeams(teams) {
    if (!domElements.teamsContainer) return;
    
    if (teams.length === 0) {
        domElements.teamsContainer.innerHTML = `
            <div class="no-teams-message">
                ${currentFilter === 'my-teams' 
                    ? 'You haven\'t joined any teams yet. Create a team or join existing ones!' 
                    : 'No teams found matching your filters.'}
            </div>
        `;
        return;
    }
    
    // Clear container
    domElements.teamsContainer.innerHTML = '<div class="loading-message">Loading teams...</div>';
    
    // Create team cards
    const teamCards = [];
    
    for (const team of teams) {
        // For "all-teams" view, check if user is already a member of this team
        let isMember = false;
        let isAdmin = false;
        
        if (currentFilter === 'all-teams') {
            // Check membership for each team
            try {
                const membership = await DataModel.checkTeamMembership(team.team_id);
                isMember = membership.isMember;
                isAdmin = membership.role === 'admin';
            } catch (error) {
                console.error(`Error checking membership for team ${team.team_id}:`, error);
            }
        } else {
            // In "my-teams" view, user is already a member
            isMember = true;
            isAdmin = team.user_role === 'admin';
        }
        
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        teamCard.setAttribute('data-team-id', team.team_id);
        
        teamCard.innerHTML = `
            <div class="team-card-header">
                <div class="team-logo">
                    <i class="fa-solid fa-users-rectangle"></i>
                </div>
                <h3 class="team-name">${team.team_name}</h3>
                ${isAdmin ? '<span class="team-admin-badge">Admin</span>' : ''}
            </div>
            <div class="team-card-body">
                <div class="team-sport">
                    <i class="fa-solid fa-trophy"></i> ${team.sport_type}
                </div>
                <div class="team-location">
                    <i class="fa-solid fa-location-dot"></i> ${team.city || 'No location'}
                </div>
                <div class="team-members">
                    <i class="fa-solid fa-user-group"></i> ${team.member_count} member${team.member_count !== 1 ? 's' : ''}
                </div>
                <div class="team-description">${team.description || 'No description available'}</div>
            </div>
            <div class="team-card-footer">
                <button class="view-team-btn action-button" data-team-id="${team.team_id}">
                    View Details
                </button>
                ${currentFilter === 'all-teams' && !isAdmin ? 
                    `<button class="join-team-btn action-button ${isMember ? 'joined' : 'primary-button'}" 
                        data-team-id="${team.team_id}" ${isMember ? 'disabled' : ''}>
                        ${isMember ? 'Joined' : 'Join Team'}
                    </button>` : 
                    ''}
            </div>
        `;
        
        teamCards.push(teamCard);
    }
    
    // Clear container and add all team cards
    domElements.teamsContainer.innerHTML = '';
    teamCards.forEach(card => {
        domElements.teamsContainer.appendChild(card);
    });
    
    // Add event listeners to team cards
    document.querySelectorAll('.view-team-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const teamId = e.target.getAttribute('data-team-id');
            showTeamDetails(teamId);
        });
    });
    
    document.querySelectorAll('.join-team-btn:not([disabled])').forEach(button => {
        button.addEventListener('click', (e) => {
            const teamId = e.target.getAttribute('data-team-id');
            joinTeam(teamId);
        });
    });
}
    
    // Handle create team form submission
    async function handleCreateTeam(e) {
        e.preventDefault();
        
        const teamData = {
            team_name: document.getElementById('teamName').value,
            sport_type: document.getElementById('teamSportType').value,
            city: document.getElementById('teamCity').value,
            description: document.getElementById('teamDescription').value
        };
        
        try {
            const result = await DataModel.createTeam(teamData);
            
            if (result && result.success) {
                // Close the modal
                domElements.teamModal.style.display = 'none';
                
                // Reset form
                domElements.teamForm.reset();
                
                // Reload teams list
                loadTeams();
                
                // Show success message
                alert('Team created successfully!');
            } else {
                alert('Failed to create team. Please try again.');
            }
        } catch (error) {
            console.error('Error creating team:', error);
            alert('An error occurred while creating the team.');
        }
    }
    
    // Join a team
    async function joinTeam(teamId) {
    try {
        const result = await DataModel.joinTeam(teamId);
        
        if (result && result.success) {
            // Find and update the join button for this team in the main list
            const joinBtn = document.querySelector(`.join-team-btn[data-team-id="${teamId}"]`);
            if (joinBtn) {
                joinBtn.textContent = 'Joined';
                joinBtn.classList.add('joined');
                joinBtn.disabled = true;
                joinBtn.classList.remove('primary-button');
            }
            
            // Show success message
            alert('You have successfully joined the team!');
        } else {
            alert('Failed to join team. Please try again.');
        }
    } catch (error) {
        console.error('Error joining team:', error);
        alert('An error occurred while joining the team.');
    }
}
    
    // Show team details
    async function showTeamDetails(teamId) {
        const teamDetailsContent = document.getElementById('teamDetailsContent');
        if (!teamDetailsContent) return;
        
        // Show modal with loading
        domElements.teamDetailsModal.style.display = 'flex';
        teamDetailsContent.innerHTML = '<div class="loading-message">Loading team details...</div>';
        
        try {
            // Get team details
            const team = await DataModel.getTeamById(teamId);
            
            // Get team members
            const members = await DataModel.getTeamMembers(teamId);
            
            // Get membership status
            const membership = await DataModel.checkTeamMembership(teamId);
            
            if (!team) {
                teamDetailsContent.innerHTML = '<div class="error-message">Team not found.</div>';
                return;
            }
            
            // Create HTML for members list
            let membersHtml = '';
            if (members && members.length > 0) {
                membersHtml = `
                    <div class="team-members-list">
                        <h4>Team Members (${members.length})</h4>
                        <ul>
                            ${members.map(member => `
                                <li class="team-member-item">
                                    <div class="member-info">
                                        <span class="member-name">${member.full_name || member.username}</span>
                                        ${member.role === 'admin' ? '<span class="admin-badge">Admin</span>' : ''}
                                    </div>
                                    <div class="member-date">
                                        Joined: ${new Date(member.joined_at).toLocaleDateString()}
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            } else {
                membersHtml = '<p>No members found.</p>';
            }
            
            // Create action button based on membership status
            let actionButton = '';
            if (membership && membership.isMember) {
                if (membership.role !== 'admin') {
                    actionButton = `
                        <button id="leaveTeamBtn" class="action-button" data-team-id="${team.team_id}">
                            Leave Team
                        </button>
                    `;
                }
            } else {
                actionButton = `
                    <button id="joinTeamFromDetailsBtn" class="action-button primary-button" data-team-id="${team.team_id}">
                        Join Team
                    </button>
                `;
            }
            
            // Render team details
            teamDetailsContent.innerHTML = `
                <div class="team-details-header">
                    <h3>${team.team_name}</h3>
                    <div class="team-creator">Created by: ${team.creator_name}</div>
                </div>
                
                <div class="team-details-info">
                    <div class="team-info-item">
                        <i class="fa-solid fa-trophy"></i> ${team.sport_type}
                    </div>
                    <div class="team-info-item">
                        <i class="fa-solid fa-location-dot"></i> ${team.city || 'No location'}
                    </div>
                    <div class="team-info-item">
                        <i class="fa-solid fa-calendar"></i> Created: ${new Date(team.created_at).toLocaleDateString()}
                    </div>
                </div>
                
                <div class="team-description-full">
                    <h4>Description</h4>
                    <p>${team.description || 'No description available.'}</p>
                </div>
                
                ${membersHtml}
                
                <div class="team-details-actions">
                    ${actionButton}
                </div>
            `;
            
            // Add event listeners to action buttons
            const joinBtn = document.getElementById('joinTeamFromDetailsBtn');
                if (joinBtn) {
                    joinBtn.addEventListener('click', async () => {
                        try {
                            const result = await DataModel.joinTeam(team.team_id);
                            
                            if (result && result.success) {
                                // Update the button to show joined status
                                joinBtn.textContent = 'Joined';
                                joinBtn.classList.add('joined');
                                joinBtn.classList.remove('primary-button');
                                joinBtn.disabled = true;
                                
                                // Also find and update any join button for this team in the main list
                                const mainJoinBtn = document.querySelector(`.join-team-btn[data-team-id="${team.team_id}"]`);
                                if (mainJoinBtn) {
                                    mainJoinBtn.textContent = 'Joined';
                                    mainJoinBtn.classList.add('joined');
                                    mainJoinBtn.classList.remove('primary-button');
                                    mainJoinBtn.disabled = true;
                                }
                                
                                // Show success message
                                alert('You have successfully joined the team!');
                                
                                // Update the membership status locally so we don't need to refresh
                                membership.isMember = true;
                                membership.role = 'member';
                                
                                // If we want to refresh the details completely, we can also call:
                                // showTeamDetails(team.team_id);
                            } else {
                                alert('Failed to join team. Please try again.');
                            }
                        } catch (error) {
                            console.error('Error joining team:', error);
                            alert('An error occurred while joining the team.');
                        }
                    });
                }
            
            const leaveBtn = document.getElementById('leaveTeamBtn');
            if (leaveBtn) {
                leaveBtn.addEventListener('click', async () => {
                    try {
                        const result = await DataModel.leaveTeam(team.team_id);
                        
                        if (result && result.success) {
                            // Close the details modal
                            domElements.teamDetailsModal.style.display = 'none';
                            
                            // Reload teams
                            loadTeams();
                            
                            // Show success message
                            alert('You have successfully left the team.');
                        } else {
                            alert('Failed to leave team. Please try again.');
                        }
                    } catch (error) {
                        console.error('Error leaving team:', error);
                        alert('An error occurred while leaving the team.');
                    }
                });
            }
        } catch (error) {
            console.error('Error loading team details:', error);
            teamDetailsContent.innerHTML = '<div class="error-message">Error loading team details. Please try again.</div>';
        }
    }
    
    // Public API - functions exposed to the outside
    return {
        init: init,
        loadTeams: loadTeams
    };
})();

// Initialize the Teams Module when loading teams tab
async function loadTeams() {
    console.log('Loading Teams Tab');
    
    // Initialize the Teams Module
    TeamsModule.init();
}