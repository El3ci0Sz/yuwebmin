# Usa uma imagem leve do Node.js
FROM node:22-alpine

# Define a pasta de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de dependências primeiro (para otimizar o cache do Docker)
COPY package.json package-lock.json* bun.lock* ./

# Instala as dependências (usa npm install, mas se estiver usando bun, pode adaptar)
RUN npm install

# Copia o resto do código do frontend
COPY . .

# Expõe a porta que o Vite/React está usando (ajuste se for 5173)
EXPOSE 3000

# Roda o servidor de desenvolvimento. 
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]