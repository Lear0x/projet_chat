# frontend/Dockerfile

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

# Construisez l'application
RUN npm run build

# Exposez le port que l'application utilise
EXPOSE 5000

# Commande pour lancer l'application
CMD ["npm", "run", "serve"]
