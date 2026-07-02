FROM eclipse-temurin:25-jdk-alpine AS builder
WORKDIR /app

COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw .
# Normaliza possíveis quebras de linha CRLF (checkout no Windows) antes de executar,
# senão o shebang "#!/bin/sh\r" não é reconhecido no Alpine e o build falha com exit 127.
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw dependency:go-offline -q

COPY src/ src/
RUN ./mvnw clean package -DskipTests -q

FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]