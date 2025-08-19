# Koristite zvaničnu Node.js sliku kao osnovu
FROM node:18-slim

# Postavite radni direktorijum u kontejneru
WORKDIR /app

# Kopirajte package.json i instalirajte zavisnosti
COPY package*.json ./
RUN npm install --only=production

# Kopirajte ostatak koda
COPY . .

# Eksponirajte port na kojem server radi
EXPOSE 8080

# Komanda za pokretanje aplikacije
CMD ["npm", "start"]