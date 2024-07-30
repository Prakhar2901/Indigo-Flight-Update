# Indigo-Flight-Update
Overview - 
This project is a web application that provides real-time flight status updates and notifications. The frontend allows users to search for flights and view their status, while the backend handles the flight data and sends email notifications for delayed flights.

Project Structure-

1.Frontend Files:

file.html: The main HTML file for the user interface.
style.css: The CSS file for styling the web page.
script.js: The JavaScript file for handling search functionality and API interactions.

2.Backend Files:

server.js: The Node.js server file that handles API requests and email notifications.

3.Data:

flights.json: Contains the data of flights.

Screenshot 1:
![I1](https://github.com/user-attachments/assets/38263d54-746e-4722-bd89-551150592ce7)

- The frontend allows users to enter either a flight number or flight name into the search bar, and upon clicking the search button, it displays the details of the matching flights. The header features the Indigo logo as well.


Screenshot 2:

![I2](https://github.com/user-attachments/assets/2f5741d9-5d4e-4a0a-ba53-724703f68523)

- After clicking the search button, the flight information section, which is initially hidden, is revealed and populated with the relevant flight details.


Working-

Frontend:-

1.Search Functionality:
-Users can enter either a flight number or flight name into the search bar.
-Upon clicking the "Search" button, the searchFlight() function is triggered.

2.Displaying Flight Information:

-The searchFlight() function makes a GET request to the backend API (/api/flights) to fetch the flight data from flights.json.
-The flight information section (flight-info) is initially hidden. It is revealed and populated with the relevant flight details only after the search button is clicked.
-The search results are displayed in a list format, and if any of the flights are delayed, an email notification is triggered.

Backend:-

1.Server Setup:-
-The backend is powered by an Express server.
-CORS is enabled to handle cross-origin requests.
-JSON body parsing is configured to handle incoming requests.

2.Flight Data Handling:
-The server reads the flight data from flights.json using the fs module.
-The flight data is served through a GET request to /api/flights.

3.Flight Status Check:
-A POST request to /api/check-flight checks the status of a specified flight.
-If the flight is delayed, a message is sent to a Kafka topic (flight-email-notifications).

#NOTE : The Kafka integration did not work as expected, so the logic for handling flight notifications was implemented directly in the code. However, this implementation also encountered issues and was not executed properly. Despite these challenges, the flight details are displayed correctly as shown in the provided screenshots.

4.Kafka Integration:

-Kafka is used for messaging and email notifications.
-Producer: Sends messages to Kafka when a flight is delayed.
-Consumer: Listens for messages on the Kafka topic and sends email notifications for delayed flights.

5.Email Notifications:

-The nodemailer module is used to send email notifications.
-When a message is received from Kafka indicating a flight delay, an email is sent to the provided email address with the flight status.

Data File:-
-flights.json: Contains flight data used by the backend to respond to API requests and check flight statuses.

