const amqp = require('amqplib');
const fs = require('fs');
const path = require('path');

async function receiveMessages() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const queue = process.env.QUEUE_NAME;

        await channel.assertQueue(queue, { durable: true });
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const messageContent = msg.content.toString();
                console.log(" [x] Received '%s'", messageContent);

                const messageObj = JSON.parse(messageContent);

                if (messageObj.imageBase64) {
                    const imageBuffer = Buffer.from(messageObj.imageBase64, 'base64');
                    const imageName = `image_${Date.now()}.jpeg`;
                    const imagePath = path.join(__dirname, 'received_images', imageName);

                    fs.writeFileSync(imagePath, imageBuffer);
                    console.log(` [x] Image saved as ${imageName}`);
                }

                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error("Error receiving messages: ", error);
    }
}

module.exports = receiveMessages;
