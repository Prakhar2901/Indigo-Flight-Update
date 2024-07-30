async function searchFlight() {
    const searchBar = document.getElementById('search-bar');
    const flightList = document.getElementById('flight-list');
    const flightInfoSection = document.getElementById('flight-info');
    const searchQuery = searchBar.value.trim().toLowerCase();

    try {
        const response = await fetch('http://localhost:5500/api/flights');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const flights = await response.json();

        // Filter flights based on the search query
        const filteredFlights = flights.filter(flight =>
            (flight.flightNumber && flight.flightNumber.toLowerCase().includes(searchQuery)) ||
            (flight.destination && flight.destination.toLowerCase().includes(searchQuery)) ||
            (flight.status && flight.status.toLowerCase().includes(searchQuery))
        );

        // Display the flight information section
        flightInfoSection.classList.add('show');

        // Display filtered flights
        displayFlights(filteredFlights);

        // Send email if any of the filtered flights are delayed
        filteredFlights.forEach(flight => {
            if (flight.status === 'Delayed' && flight.email) {
                sendEmailNotification(flight);
            }
        });

    } catch (error) {
        console.error('Error fetching flights:', error);
        flightList.innerHTML = `<li>Error fetching flight data. Please try again later.</li>`;
    }
}

function displayFlights(flights) {
    const flightList = document.getElementById('flight-list');
    flightList.innerHTML = '';

    if (flights.length === 0) {
        flightList.innerHTML = '<li>No flights found.</li>';
        return;
    }

    flights.forEach(flight => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>Flight Number:</strong> ${flight.flightNumber || 'N/A'}<br>
            <strong>Destination:</strong> ${flight.destination || 'N/A'}<br>
            <strong>Status:</strong> ${flight.status || 'N/A'}<br>
            <strong>Gate:</strong> ${flight.gate || 'N/A'}<br>
            <strong>Time:</strong> ${flight.time || 'N/A'}
        `;
        flightList.appendChild(listItem);
    });
}

async function sendEmailNotification(flight) {
    const response = await fetch('http://localhost:5500/api/check-flight', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            flightNumber: flight.flightNumber,
            email: flight.email
        }),
    });

    const data = await response.json();

    if (response.ok) {
        console.log(`Email sent for flight ${flight.flightNumber}:`, data.message);
    } else {
        console.error(`Failed to send email for flight ${flight.flightNumber}:`, data.error);
    }
}