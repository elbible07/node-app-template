////////////////////////////////////////////////////////////////
//DATAMODEL.JS
//THIS IS YOUR "MODEL", IT INTERACTS WITH THE ROUTES ON YOUR
//SERVER TO FETCH AND SEND DATA.  IT DOES NOT INTERACT WITH
//THE VIEW (dashboard.html) OR THE CONTROLLER (dashboard.js)
//DIRECTLY.  IT IS A "MIDDLEMAN" BETWEEN THE SERVER AND THE
//CONTROLLER.  ALL IT DOES IS MANAGE DATA.
////////////////////////////////////////////////////////////////

const DataModel = (function () {
    //WE CAN STORE DATA HERE SO THAT WE DON'T HAVE TO FETCH IT
    //EVERY TIME WE NEED IT.  THIS IS CALLED "CACHING".
    //WE CAN ALSO STORE THINGS HERE TO MANAGE STATE, LIKE
    //WHEN THE USER SELECTS SOMETHING IN THE VIEW AND WE
    //NEED TO KEEP TRACK OF IT SO WE CAN USE THAT INFOMRATION
    //LATER.  RIGHT NOW, WE'RE JUST STORING THE JWT TOKEN
    //AND THE LIST OF USERS.
    let token = null;  // Holds the JWT token
    let users = [];    // Holds the list of users

    //WE CAN CREATE FUNCTIONS HERE TO FETCH DATA FROM THE SERVER
    //AND RETURN IT TO THE CONTROLLER.  THE CONTROLLER CAN THEN
    //USE THAT DATA TO UPDATE THE VIEW.  THE CONTROLLER CAN ALSO
    //SEND DATA TO THE SERVER TO BE STORED IN THE DATABASE BY
    //CALLING FUNCTIONS THAT WE DEFINE HERE.
    return {
        //utility function to store the token so that we
        //can use it later to make authenticated requests
        setToken: function (newToken) {
            token = newToken;
        },

        //function to fetch the list of users from the server
        getUsers: async function () {
            // Check if the token is set
            if (!token) {
                console.error("Token is not set.");
                return [];
            }

            try {
                // this is our call to the /api/users route on the server
                const response = await fetch('/api/users', {
                    method: 'GET',
                    headers: {
                        // we need to send the token in the Authorization header
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    console.error("Error fetching users:", await response.json());
                    return [];
                }

                const data = await response.json();
                
                // Format the users data for display
                users = data.users.map(user => 
                    `${user.username} (${user.email}) - ${user.full_name || 'No name'} from ${user.city || 'Unknown location'}`
                );
                
                return users;
            } catch (error) {
                console.error("Error in API call:", error);
                return [];
            }
        },

        // Get the current user's information
        getCurrentUser: async function() {
            if (!token) {
                console.error("Token is not set.");
                return null;
            }

            try {
                const response = await fetch('/api/auth/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    console.error("Error fetching current user:", await response.json());
                    return null;
                }

                return await response.json();
            } catch (error) {
                console.error("Error fetching current user:", error);
                return null;
            }
        },

        // Create a new event
        createEvent: async function(eventData) {
            if (!token) {
                console.error("Token is not set.");
                return null;
            }

            try {
                const response = await fetch('/api/events', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(eventData)
                });

                if (!response.ok) {
                    console.error("Error creating event:", await response.json());
                    return null;
                }

                return await response.json();
            } catch (error) {
                console.error("Error creating event:", error);
                return null;
            }
        },

        // Get all events
        getEvents: async function() {
            if (!token) {
                console.error("Token is not set.");
                return [];
            }

            try {
                const response = await fetch('/api/events', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.error("Error fetching events:", await response.json());
                    return [];
                }

                const data = await response.json();
                return data.events || [];
            } catch (error) {
                console.error("Error fetching events:", error);
                return [];
            }
        },

        // Get events created by the current user
        getMyEvents: async function() {
            if (!token) {
                console.error("Token is not set.");
                return [];
            }

            try {
                const response = await fetch('/api/events/my-events', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.error("Error fetching my events:", await response.json());
                    return [];
                }

                const data = await response.json();
                return data.events || [];
            } catch (error) {
                console.error("Error fetching my events:", error);
                return [];
            }
        },

        // Get a specific event by ID
        getEventById: async function(eventId) {
            if (!token) {
                console.error("Token is not set.");
                return null;
            }

            try {
                const response = await fetch(`/api/events/${eventId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.error("Error fetching event:", await response.json());
                    return null;
                }

                const data = await response.json();
                return data.event || null;
            } catch (error) {
                console.error("Error fetching event:", error);
                return null;
            }
        },
	// Join an event
        joinEvent: async function(eventId) {
            if (!token) {
                console.error("Token is not set.");
                return null;
            }

            try {
                const response = await fetch(`/api/events/${eventId}/join`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.error("Error joining event:", await response.json());
                    return null;
                }

                return await response.json();
            } catch (error) {
                console.error("Error joining event:", error);
                return null;
            }
        },

        // Get events the user has joined
        getJoinedEvents: async function() {
            if (!token) {
                console.error("Token is not set.");
                return [];
            }

            try {
                const response = await fetch('/api/events/joined', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.error("Error fetching joined events:", await response.json());
                    return [];
                }

                const data = await response.json();
                return data.events || [];
            } catch (error) {
                console.error("Error fetching joined events:", error);
                return [];
            }
        },

        // Check if user has joined a specific event
        checkEventJoined: async function(eventId) {
            if (!token) {
                console.error("Token is not set.");
                return false;
            }

            try {
                const response = await fetch(`/api/events/${eventId}/joined`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.error("Error checking event status:", await response.json());
                    return false;
                }

                const data = await response.json();
                return data.joined || false;
            } catch (error) {
                console.error("Error checking event status:", error);
                return false;
            }
        },
        
        // Get event participants
        getEventParticipants: async function(eventId) {
            if (!token) {
                console.error("Token is not set.");
                return [];
            }

            try {
                const response = await fetch(`/api/events/${eventId}/participants`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.error("Error fetching event participants:", await response.json());
                    return [];
                }

                const data = await response.json();
                return data.participants || [];
            } catch (error) {
                console.error("Error fetching event participants:", error);
                return [];
            }
        },
        
        createTeam: async function(teamData) {
            if (!token) {
                console.error("Token is not set.");
                return null;
            }

            try {
                const response = await fetch('/api/teams', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(teamData)
                });

                if (!response.ok) {
                    console.error("Error creating team:", await response.json());
                    return null;
                }

                return await response.json();
            } catch (error) {
                console.error("Error creating team:", error);
                return null;
            }
        },

        // Get all teams
        getTeams: async function() {
            if (!token) {
                console.error("Token is not set.");
                return [];
            }

            try {
                const response = await fetch('/api/teams', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.error("Error fetching teams:", await response.json());
                    return [];
                }

                const data = await response.json();
                return data.teams || [];
            } catch (error) {
                console.error("Error fetching teams:", error);
                return [];
            }
        },

        // Get teams the user is a member of
        getMyTeams: async function() {
            if (!token) {
                console.error("Token is not set.");
                return [];
            }

            try {
                const response = await fetch('/api/teams/my-teams', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.error("Error fetching my teams:", await response.json());
                    return [];
                }

                const data = await response.json();
                return data.teams || [];
            } catch (error) {
                console.error("Error fetching my teams:", error);
                return [];
            }
        },

        // Get a specific team by ID
        getTeamById: async function(teamId) {
            if (!token) {
                console.error("Token is not set.");
                return null;
            }

            try {
                const response = await fetch(`/api/teams/${teamId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.error("Error fetching team:", await response.json());
                    return null;
                }

                const data = await response.json();
                return data.team || null;
            } catch (error) {
                console.error("Error fetching team:", error);
                return null;
            }
        },

        // Join a team
        joinTeam: async function(teamId) {
            if (!token) {
                console.error("Token is not set.");
                return null;
            }

            try {
                const response = await fetch(`/api/teams/${teamId}/join`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.error("Error joining team:", await response.json());
                    return null;
                }

                return await response.json();
            } catch (error) {
                console.error("Error joining team:", error);
                return null;
            }
        },

        // Leave a team
        leaveTeam: async function(teamId) {
            if (!token) {
                console.error("Token is not set.");
                return null;
            }

            try {
                const response = await fetch(`/api/teams/${teamId}/leave`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.error("Error leaving team:", await response.json());
                    return null;
                }

                return await response.json();
            } catch (error) {
                console.error("Error leaving team:", error);
                return null;
            }
        },

        // Get team members
        getTeamMembers: async function(teamId) {
            if (!token) {
                console.error("Token is not set.");
                return [];
            }

            try {
                const response = await fetch(`/api/teams/${teamId}/members`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.error("Error fetching team members:", await response.json());
                    return [];
                }

                const data = await response.json();
                return data.members || [];
            } catch (error) {
                console.error("Error fetching team members:", error);
                return [];
            }
        },

        // Check if user is a member of a team
        checkTeamMembership: async function(teamId) {
            if (!token) {
                console.error("Token is not set.");
                return {isMember: false, role: null};
            }

            try {
                const response = await fetch(`/api/teams/${teamId}/membership`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.error("Error checking team membership:", await response.json());
                    return {isMember: false, role: null};
                }

                const data = await response.json();
                return {
                    isMember: data.isMember || false,
                    role: data.role || null
                };
            } catch (error) {
                console.error("Error checking team membership:", error);
                return {isMember: false, role: null};
            }
        }
        
    };
})();