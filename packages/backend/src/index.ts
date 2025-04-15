import express from 'express';
import ws from 'ws';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import { authenticate } from './auth';
import StaffModel from './models/staffModel';

require('dotenv').config({ path: process.env.npm_lifecycle_event === 'prod' ? __dirname + '/../.env.prod' : __dirname + '/../.env.dev'});
mongoose.connect(process.env.MONGO_URI!)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

const app = express();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = 3000;

const server = http.createServer(app);

const wss = new ws.Server({ server });
wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', message => {
        console.log(`Received: ${message}`);
        ws.send(`Echo: ${message}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.send('Welcome to the WebSocket server!');
});


app.post('/auth', authenticate);

app.get('/', async (req, res) => {
    res.json((await StaffModel.find({})))
})

// Use the HTTP server to listen
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});