// order-service/server.js
const express = require('express');
const app = express();
const PORT = 3002; // Internal port for the container

app.get('/', (req, res) => {
    res.send('Order Service is running.');
});

app.get('/orders', (req, res) => {
    // Sample data for the API endpoint
    const orders = [
        { orderId: 'O101', item: 'Laptop', userId: 1 },
        { orderId: 'O102', item: 'Monitor', userId: 2 }
    ];
    res.status(200).json(orders);
});

app.listen(PORT, () => {
    console.log(`Order Service listening on port ${PORT}`);
});