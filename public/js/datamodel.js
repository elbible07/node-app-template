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
        }

        //ADD MORE FUNCTIONS HERE TO FETCH DATA FROM THE SERVER
        //AND SEND DATA TO THE SERVER AS NEEDED
    };
})();