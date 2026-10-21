# ==============================================================================
# CampusNexa - Multi-Stage Production Dockerfile
# ==============================================================================

# Stage 1: Build Java WAR using Maven and Eclipse Temurin JDK 17
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /build

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code and compile production WAR
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Production Runtime with Apache Tomcat 10.1 (Jakarta EE 10)
FROM tomcat:10.1-jdk17-temurin

LABEL maintainer="CampusNexa Team"
LABEL description="Campus Maintenance & Grievance Management System"

WORKDIR /usr/local/tomcat

# Remove default Tomcat webapps
RUN rm -rf webapps/*

# Copy compiled WAR as the ROOT webapp
COPY --from=builder /build/target/campus-maintenance-system.war webapps/ROOT.war

# Default Port
EXPOSE 8080

# Environment variables with cloud defaults (can be overridden at runtime)
ENV DB_URL="jdbc:mysql://localhost:3306/maintenance_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
ENV DB_USER="root"
ENV DB_PASSWORD=""

# Run Tomcat in foreground
CMD ["catalina.sh", "run"]
