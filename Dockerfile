# 📦 Bazna slika
FROM node:20

# 📁 Radni direktorijum
WORKDIR /app

# 📥 Instalacija zavisnosti
COPY package*.json ./
RUN npm install

# 📄 Kopiraj ostatak koda
COPY . .

# 🔊 Izloži port (npr. 3000)
EXPOSE 5000

# 🚀 Startuj aplikaciju
CMD ["npx", "pm2-runtime", "start", "ecosystem.config.js"]