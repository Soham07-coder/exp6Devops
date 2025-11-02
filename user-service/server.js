// user-service/server.js
const express = require('express');
const app = express();
const PORT = 3001; // Internal port for the container

app.get('/', (req, res) => {
    res.send('User Service is running.');
});

app.get('/users', (req, res) => {
    // Sample data for the API endpoint
    const users = [
        { id: 1, name: 'Alice', role: 'Admin' },
        { id: 2, name: 'Bob', role: 'User' }
    ];
    res.status(200).json(users);
});

app.listen(PORT, () => {
    console.log(`User Service listening on port ${PORT}`);
});