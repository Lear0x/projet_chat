const express = require('express');
const bodyParser = require('body-parser');
const { sendMessageToRoom } = require('./producer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

let chatRooms = ['public_room'];
let usersInRooms = {}; // Pour stocker les utilisateurs dans chaque salle de discussion

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
	if (!usersInRooms.hasOwnProperty(room)) {
		usersInRooms[room] = [];
	}

    // Vérifier si la salle de discussion existe, sinon la créer
    if (!chatRooms.includes(room)) {
        chatRooms.push(room);
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
