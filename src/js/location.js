document.addEventListener('DOMContentLoaded', () => {
    const getLocationBtn = document.getElementById('getLocationBtn');
    const resultsDiv = document.getElementById('results');
    const buttonContainer = document.getElementById('button-container');
    let watchId = null; // Variable to store the ID of the watchPosition process

    // --- Function to display coordinates ---
    function displayCoordinates(latitude, longitude) {
        const locationElement = document.createElement('p');
        const now = new Date();
        // Using toFixed for slightly cleaner coordinate display
        locationElement.textContent = `${now.toLocaleTimeString()}: Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`;

        // Prepend the new location to the results div, right after the h2
        const heading = resultsDiv.querySelector('h2');
        if (heading) {
            heading.insertAdjacentElement('afterend', locationElement);
        } else {
            resultsDiv.prepend(locationElement); // Fallback
        }
    }

    // --- Function to handle successful geolocation updates ---
    function handleSuccess(position) {
        console.log("Geolocation update received:", position);
        // Hide the button container ONLY if it's not already hidden (needed only once)
        if (!buttonContainer.classList.contains('hidden')) {
            buttonContainer.classList.add('hidden');
        }
        const { latitude, longitude } = position.coords;
        displayCoordinates(latitude, longitude); // Display the updated coordinates
    }

    // --- Function to handle geolocation errors ---
    function handleError(error) {
        console.error("Geolocation error:", error);

        // Stop watching if a persistent error occurs (like permission denied)
        // This prevents repeated error messages for the same issue.
        if (error.code === error.PERMISSION_DENIED && watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null; // Reset watchId
            console.log("Stopped watching due to permission denial.");
        }

        // Display error message (only display once per specific error type if needed)
        // For simplicity, we'll allow displaying multiple errors if they occur over time
        let errorMessage = "Location Error: ";
        switch(error.code) {
            case error.PERMISSION_DENIED:
                errorMessage += "Permission denied.";
                // Ensure button is hidden if permission denied
                if (!buttonContainer.classList.contains('hidden')) {
                   buttonContainer.classList.add('hidden');
                }
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage += "Location information is unavailable.";
                break;
            case error.TIMEOUT:
                errorMessage += "The request timed out.";
                break;
            case error.UNKNOWN_ERROR:
                errorMessage += "An unknown error occurred.";
                break;
        }
        const errorElement = document.createElement('p');
        errorElement.style.color = 'red';
        errorElement.textContent = errorMessage;
        resultsDiv.prepend(errorElement); // Add error message to the top
    }

    // --- Function to start watching the position ---
    function startWatchingPosition() {
        // Clear any existing watch first to avoid duplicates if function is called again
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
        }

        console.log("Starting geolocation watch...");
        // Options for watchPosition (similar to getCurrentPosition)
        const options = {
            enableHighAccuracy: true, // Request more accurate position
            timeout: 15000,         // Max time allowed to return a position
            maximumAge: 0           // Don't use a cached position, always get current
        };

        // Start watching and store the ID
        watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
    }

    // --- Check initial permission status ---
    if ('geolocation' in navigator && 'permissions' in navigator) {
        navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
            console.log('Initial geolocation permission state:', permissionStatus.state);

            // If permission already granted, start watching immediately
            if (permissionStatus.state === 'granted') {
                startWatchingPosition();
            }
            // If denied, hide button and show message
            else if (permissionStatus.state === 'denied') {
                buttonContainer.classList.add('hidden');
                // Use the error handler to display the message
                handleError({ code: GeolocationPositionError.PERMISSION_DENIED, message: "Permission denied." });
            }
            // Otherwise (state is 'prompt'), the button remains visible.

            // Listen for changes in permission status
            permissionStatus.onchange = () => {
                console.log('Geolocation permission state changed:', permissionStatus.state);
                if (permissionStatus.state === 'granted') {
                    // If permission granted later, start watching
                    startWatchingPosition();
                } else {
                    // If permission revoked or set to prompt, stop watching
                    if (watchId !== null) {
                        navigator.geolocation.clearWatch(watchId);
                        watchId = null;
                        console.log("Stopped geolocation watch due to permission change.");
                    }
                    // Show button again only if state becomes 'prompt'
                    if(permissionStatus.state === 'prompt') {
                         buttonContainer.classList.remove('hidden');
                    } else if (permissionStatus.state === 'denied') {
                        // If denied, hide button and show message
                        buttonContainer.classList.add('hidden');
                        handleError({ code: GeolocationPositionError.PERMISSION_DENIED, message: "Permission denied." });
                    }
                }
            };
        });
    } else {
        // Geolocation or Permissions API not supported
        console.error("Geolocation or Permissions API is not supported by this browser.");
        getLocationBtn.textContent = "Geolocation Not Supported";
        getLocationBtn.disabled = true;
        buttonContainer.classList.remove('hidden'); // Ensure button container is visible
        const errorElement = document.createElement('p');
        errorElement.style.color = 'red';
        errorElement.textContent = "Sorry, your browser does not support geolocation.";
        resultsDiv.prepend(errorElement);
    }

    // --- Add click listener to the button ---
    getLocationBtn.addEventListener('click', () => {
        console.log("Get Location button clicked");
        // When the button is clicked, attempt to start watching.
        // This will trigger the permission prompt if the state is 'prompt'.
        // handleSuccess will hide the button upon the first successful update.
        if ('geolocation' in navigator) {
            startWatchingPosition();
        }
    });
});