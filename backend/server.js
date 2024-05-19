const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

const options = Array.from({ length: 26 }, (_, i) => {
    const value = (10 + i).toString(36) + (10 + i);
    return { label: value, value: value };
});

// Define a class for handling API endpoints
class APIHandler {
    constructor() {
        this.app = express();
        this.port = port;
        this.options = options;

        // Bind methods to the instance to maintain 'this' reference
        this.handleOptionsRequest = this.handleOptionsRequest.bind(this);
        this.handleSubmission = this.handleSubmission.bind(this);

        // Initialize the API routes
        this.initRoutes();

        // Start the server
        this.startServer();
    }

    // Method to initialize API routes
    initRoutes() {
        this.app.use(express.json());
        this.app.use(cors());

        // Endpoint to handle option filtering
        this.app.get('/api/options', this.handleOptionsRequest);

        // Endpoint to handle form submission
        this.app.post('/api/submit', this.handleSubmission);
    }

    // Method to handle options request
    handleOptionsRequest(req, res) {
        const searchQuery = req.query.search.toLowerCase();
        const filteredOptions = this.options.filter(option => option.label.includes(searchQuery));
        res.json(filteredOptions);
    }

    // Method to handle form submission
    handleSubmission(req, res) {
        const { selectedOptions } = req.body;
        console.log('Received options:', selectedOptions);
        res.status(200).send('Options received');
    }

    // Method to start the server
    startServer() {
        this.app.listen(this.port, () => {
            console.log(`Server is running on http://localhost:${this.port}`);
        });
    }
}

// Instantiate the APIHandler class to start the server
new APIHandler();