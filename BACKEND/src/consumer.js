const amqp = require('amqplib');

async function createConsumer(onMessage) {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();

        const queue = process.env.QUEUE_NAME || 'public_room';

        await channel.assertQueue(queue, { durable: true });

        console.log(` [*] Waiting for messages in ${queue}. To exit press CTRL+C`);

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const messageObj = JSON.parse(msg.content.toString());
                const room = queue;
                console.log(` [x] Received message in room '${room}': `, messageObj);
                onMessage(room, messageObj);
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error("Error creating consumer: ", error);
    }
}

module.exports = { createConsumer };
