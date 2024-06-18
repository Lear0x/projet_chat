const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sendMessageToRoom } = require('./producer');
const { createConsumer } = require('./consumer');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

let chatRooms = ['public_room'];
let usersInRooms = {}; // Pour stocker les utilisateurs dans chaque salle de discussion
let dict = []; // Pour stocker les utilisateurs et leurs mots de passe

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Création d'un serveur WebSocket
const wss = new WebSocket.Server({ server });

// Stocker les connexions WebSocket par utilisateur et par salle
let wsClients = {};

wss.on('connection', (ws, req) => {
    ws.on('message', (message) => {
        const { type, username, room } = JSON.parse(message);

        if (type === 'join') {
            // Assigner la connexion WebSocket à l'utilisateur et à la salle
            if (!wsClients[room]) {
                wsClients[room] = [];
            }
            wsClients[room].push({ username, ws });
        }
    });
});

// Route pour s'inscrire
app.post('/signUp', (req, res) => {
    const { username, password} = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    if (dict.find(user => user.username === username)) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    dict.push({ username: username, password: password });
    res.status(200).json({
        message: `User ${username} signed up`
    });
});

// Route pour se connecter
app.post('/signIn', (req, res) => {
    const { username, password } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    const user = dict.find(user => user.username === username);
    if (!user) {
        return res.status(400).json({ error: 'Username does not exist' });
    }

    if (user.password !== password) {
        return res.status(400).json({ error: 'Wrong password' });
    }

    res.status(200).json({
        message: `User ${username} signed in`,
        username: username,
    });
});

// Route pour envoyer un message à une salle de discussion spécifique
app.post('/send-to-room', async (req, res) => {
    const { username, message, room } = req.body;

    if (!username || !message || !room) {
        return res.status(400).json({ error: 'Username, message, and room are required' });
    }

    // Vérifier si la salle de discussion existe
    if (!chatRooms.includes(room)) {
        return res.status(400).json({ error: 'Room does not exist' });
    }


    // Envoyer le message à tous les utilisateurs de la salle
    await sendMessageToRoom(username, message, room);

    res.json({ message: 'Message sent to room' });
});

// Route pour rejoindre une salle de discussion
app.post('/join-room', (req, res) => {
    const { username, room } = req.body;

    if (!username || !room) {
        return res.status(400).json({ error: 'Username and room are required' });
    }

    // Vérifier si la salle de discussion existe, sinon la créer
    if (!chatRooms.includes(room)) {
        chatRooms.push(room);
        usersInRooms[room] = [];
    }

	if (!usersInRooms[room]) {
        usersInRooms[room] = [];
    }

    // Ajouter l'utilisateur à la salle de discussion
    if (!usersInRooms[room].includes(username)) {
        usersInRooms[room].push(username);
    }

    res.json({ message: `User ${username} joined room ${room}` });
});

// Endpoint pour récupérer tous les utilisateurs dans une salle de discussion
app.get('/users-in-room/:room', (req, res) => {
    const room = req.params.room;

    if (!room || !chatRooms.includes(room)) {
        return res.status(400).json({ error: 'Room does not exist' });
    }

    const users = usersInRooms[room] || [];
    res.json({ users });
});

// Créer et démarrer le consommateur RabbitMQ
createConsumer((room, messageObj) => {
    if (wsClients[room]) {
        wsClients[room].forEach(client => {
            client.ws.send(JSON.stringify(messageObj));
        });
    }
});
