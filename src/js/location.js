document.addEventListener('DOMContentLoaded', () => {
    const getLocationBtn = document.getElementById('getLocationBtn');
    const resultsDiv = document.getElementById('results');
    const buttonContainer = document.getElementById('button-container'); // Get container ref

    // --- Function to display coordinates ---
    function displayCoordinates(latitude, longitude) {
        const locationElement = document.createElement('p');
        const now = new Date();
        locationElement.textContent = `${now.toLocaleTimeString()}: Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`;

        // Prepend the new location to the results div, right after the h2
        const heading = resultsDiv.querySelector('h2');
        if (heading) {
            heading.insertAdjacentElement('afterend', locationElement);
        } else {
            // Fallback if h2 is somehow missing
            resultsDiv.prepend(locationElement);
        }
    }

    // --- Function to handle successful geolocation ---
    function handleSuccess(position) {
        console.log("Geolocation successful:", position);
        const { latitude, longitude } = position.coords;
        // Hide the button container once permission is granted and location is found
        buttonContainer.classList.add('hidden');
        displayCoordinates(latitude, longitude);
    }

    // --- Function to handle geolocation errors ---
    function handleError(error) {
        console.error("Geolocation error:", error);
        let errorMessage = "Could not get location: ";
        switch(error.code) {
            case error.PERMISSION_DENIED:
                errorMessage += "Permission denied.";
                // Hide the button container if permission is explicitly denied
                buttonContainer.classList.add('hidden');
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
        // Display error message in the results div
        const errorElement = document.createElement('p');
        errorElement.style.color = 'red';
        errorElement.textContent = errorMessage;
        resultsDiv.prepend(errorElement); // Add error message to the top
    }

    // --- Check initial permission status ---
    if ('geolocation' in navigator && 'permissions' in navigator) {
        navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
            console.log('Initial geolocation permission state:', permissionStatus.state);

            // Hide button immediately if already granted and try getting location
            if (permissionStatus.state === 'granted') {
                buttonContainer.classList.add('hidden');
                navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
                    enableHighAccuracy: true, // Optional: request more accurate position
                    timeout: 10000,         // Optional: time limit in ms
                    maximumAge: 0           // Optional: force fresh location data
                });
            }
             // Hide button if denied (user needs to change in browser settings)
             else if (permissionStatus.state === 'denied') {
                 buttonContainer.classList.add('hidden');
                 handleError({ code: GeolocationPositionError.PERMISSION_DENIED }); // Simulate denied error
            }
             // Otherwise (state is 'prompt'), the button remains visible for the user to click.

            // Listen for changes in permission status (e.g., if user changes it in settings)
            permissionStatus.onchange = () => {
                console.log('Geolocation permission state changed:', permissionStatus.state);
                if (permissionStatus.state === 'granted') {
                    buttonContainer.classList.add('hidden');
                    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
                } else if (permissionStatus.state === 'denied') {
                    buttonContainer.classList.add('hidden');
                } else { // 'prompt'
                    buttonContainer.classList.remove('hidden'); // Show button if changed back to prompt
                }
            };
        });

    } else {
        // Geolocation or Permissions API not supported
        console.error("Geolocation or Permissions API is not supported by this browser.");
        getLocationBtn.textContent = "Geolocation Not Supported";
        getLocationBtn.disabled = true;
        const errorElement = document.createElement('p');
        errorElement.style.color = 'red';
        errorElement.textContent = "Sorry, your browser does not support geolocation.";
        resultsDiv.prepend(errorElement);
        buttonContainer.classList.remove('hidden'); // Ensure button area is visible to show the disabled btn
    }


    // --- Add click listener to the button ---
    getLocationBtn.addEventListener('click', () => {
        console.log("Get Location button clicked");
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        }
    });
});