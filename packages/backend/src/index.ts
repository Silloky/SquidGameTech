import express from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import { authenticate } from './auth';
import handleWS from './websocket/indexHandler';
import { Server } from 'socket.io';
import { ServerAug } from 'types';

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

const io: ServerAug = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
    serveClient: false,
})

io.on('connection', (socket) => handleWS(socket, io));

app.post('/auth', authenticate);

// Use the HTTP server to listen
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://ip:${PORT}`);
});