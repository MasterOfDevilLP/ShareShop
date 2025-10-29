FROM maven:3-eclipse-temurin-21-alpine

#RUN apk update && apk add java-postgresql-jdbc

WORKDIR .
COPY pom.xml /app/

RUN mvn -B -f /app/pom.xml -s /usr/share/maven/ref/settings-docker.xml dependency:go-offline

COPY src/ /app/src/
COPY config_docker.json /app/config.json

RUN cd /app && /usr/local/bin/mvn-entrypoint.sh mvn package

# run without invoking maven. This results in faster startup
# change the jar name to something that doesn't change, or find a better way to run this (maven exec is a bit annoying)
CMD ["java", "-Djava.util.logging.config.file=logging.properties", "-jar", "/app/target/htwd-shareshop-1.0.0.jar", "/app/config.json"]