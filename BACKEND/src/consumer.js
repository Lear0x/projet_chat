const amqp = require('amqplib');

async function receiveMessages() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const queue = process.env.QUEUE_NAME;

        await channel.assertQueue(queue, { durable: true });
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                console.log(" [x] Received '%s'", msg.content.toString());
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error("Error receiving messages: ", error);
    }
}

module.exports = receiveMessages;
