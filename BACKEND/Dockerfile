# backend/Dockerfile

# Utilisez une image officielle Node.js comme image de base
FROM node:14

# Définissez le répertoire de travail dans le conteneur
WORKDIR /app

# Copiez le package.json et package-lock.json
COPY package*.json ./

# Installez les dépendances
RUN npm install

# Copiez le reste de l'application
COPY . .

# Définissez la variable d'environnement pour la connexion RabbitMQ
ENV RABBITMQ_URL=amqp://rabbitmq:5672
ENV QUEUE_NAME=public_room

# Exposez le port que l'application utilise
EXPOSE 3000

# Commande pour lancer l'application
CMD ["node", "src/server.js"]
