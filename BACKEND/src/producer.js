const amqp = require('amqplib');
const fs = require('fs');

async function sendMessageToRoom(username, message, room = 'public_room', imageBase64) {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        channel.assertQueue(room, { durable: true });

        const messageObj = {
            username,
            message,
            timestamp: new Date().toISOString()
        };

        if (imageBase64) {
            messageObj.imageBase64 = imageBase64;
        }

        const bool = channel.sendToQueue(room, Buffer.from(JSON.stringify(messageObj)), { persistent: true });

        console.log('send ', bool);
        console.log(` [x] Sent message from '${username}' in room '${room}': '${message}'`);
        
        setTimeout(() => {
            channel.close();
            connection.close();
        }, 500);
    } catch (error) {
        console.error("Error sending message: ", error);
    }
}

async function triggersUserLogout(username, room = 'public_room') {
	try {
		const connection = await amqp.connect(process.env.RABBITMQ_URL);
		const channel = await connection.createChannel();
		channel.assertQueue(room, { durable: true });
	
		const messageObj = {
			username,
			message: 'logout',
			timestamp: new Date().toISOString()
		};
	
		channel.sendToQueue(room, Buffer.from(JSON.stringify(messageObj)), { persistent: true });
	
       
		console.log(`[x] '${username}' has logged out`);

		setTimeout(() => {
            channel.close();
            connection.close();
        }, 500);
	} catch (error) {
        console.error("Error logout: ", error);
    }



}

async function triggersLogin(username, room = 'public_room') {
	try {
		const connection = await amqp.connect(process.env.RABBITMQ_URL);
		const channel = await connection.createChannel();
		channel.assertQueue(room, { durable: true });
	
		const messageObj = {
			username,
			message: 'login',
			timestamp: new Date().toISOString()
		};
	
		channel.sendToQueue(room, Buffer.from(JSON.stringify(messageObj)), { persistent: true });
	
		console.log(`[x] '${username}' is logged in`);

		setTimeout(() => {
            channel.close();
            connection.close();
        }, 500);
	} catch (error) {
        console.error("Error logout: ", error);
    }
}

module.exports = { sendMessageToRoom, triggersUserLogout, triggersLogin };
