const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const kafka = require('kafka-node');

const app = express();

const port = 5500;

// Using CORS to allow cross-origin requests
app.use(cors());
app.use(express.json()); // Add this to parse JSON request bodies

// Kafka configuration
const kafkaClient = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const producer = new kafka.Producer(kafkaClient);
const consumer = new kafka.Consumer(kafkaClient, [{ topic: 'flight-email-notifications', partition: 0 }], { autoCommit: true });

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'prakharq@gmail.com',
    pass: 'Football@1234'
  }
});

// Define the route to get flight data
app.get('/api/flights', (_req, res) => {
  // Read the flights.json file
  fs.readFile(path.join(__dirname, 'flights.json'), 'utf8', (err, data) => {
    if (err) {
      // Send an error response if the file read fails
      return res.status(500).json({ error: 'Failed to read flight data' });
    }

    // Parse the JSON data
    const flights = JSON.parse(data);

    // Send the flight data as a response
    res.json(flights);
  });
});

// Define a new route to handle flight status checks and Kafka messaging
app.post('/api/check-flight', (req, res) => {
  const { flightNumber, email } = req.body;

  if (!flightNumber || !email) {
    return res.status(400).json({ error: 'Flight number and email are required' });
  }

  // Read the flights.json file
  fs.readFile(path.join(__dirname, 'flights.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read flight data' });
    }

    // Parse the JSON data
    const flights = JSON.parse(data);
    const flight = flights.find(f => f.flightNumber === flightNumber);

    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    const { status } = flight;

    if (status === 'Delayed') {
      const message = {
        topic: 'flight-email-notifications',
        messages: JSON.stringify({ flightNumber, status, email }),
      };

      producer.send([message], (err, data) => {
        if (err) {
          console.error('Failed to send message to Kafka:', err);
          return res.status(500).json({ error: 'Failed to send message to Kafka' });
        } else {
          console.log('Message sent to Kafka:', data);
          return res.json({ message: 'Notification request sent successfully' });
        }
      });
    } else {
      res.json({ message: 'Flight is not delayed' });
    }
  });
});

// Kafka consumer to process messages and send emails
consumer.on('message', (message) => {
  const flightUpdate = JSON.parse(message.value);
  const { flightNumber, status, email } = flightUpdate;

  if (status === 'Delayed' && email) {
    const mailOptions = {
      from: 'prakharq@gmail.com',
      to: email,
      subject: `Flight ${flightNumber} Status Update`,
      text: `Dear passenger,\n\nYour flight ${flightNumber} is currently ${status}.\n\nBest regards,\nFlight Updates Team`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Failed to send email:', err);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

