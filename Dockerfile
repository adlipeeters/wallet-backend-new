# Definirea imaginii de bază
FROM node:16-alpine

# Setarea directorului de lucru
WORKDIR /app

# Copierea fișierelor necesare
COPY package*.json ./
COPY tsconfig*.json ./
COPY src ./src

# Instalarea dependențelor
RUN npm install

# Compilarea aplicației
RUN npm run build

# Setarea portului de expunere
EXPOSE 3000

# Pornirea aplicației
CMD ["npm", "run", "start:prod"]
