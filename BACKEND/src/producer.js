const amqp = require('amqplib');

async function sendMessageToRoom(username, message, room = 'public_room') {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        channel.assertQueue(room, { durable: true });

        const messageObj = {
            username,
            message,
            timestamp: new Date().toISOString()
        };

        channel.sendToQueue(room, Buffer.from(JSON.stringify(messageObj)), { persistent: true });
        console.log(` [x] Sent message from '${username}' in room '${room}': '${message}'`);
        
        setTimeout(() => {
            channel.close();
            connection.close();
        }, 500);
    } catch (error) {
        console.error("Error sending message: ", error);
    }
}

module.exports = { sendMessageToRoom };
