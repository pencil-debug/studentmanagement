# Student Management Application

A two-tier Student Management Application built using Java Spring Boot,
MySQL, Docker, Jenkins, GitHub Actions, and Kubernetes.

## Architecture

Frontend
    |
    v
Spring Boot Application
    |
    v
MySQL
    |
    v
PersistentVolume

## Technologies

- Java 17
- Spring Boot
- Spring Data JPA
- MySQL 8
- HTML
- CSS
- JavaScript
- Docker
- GitHub Actions
- Jenkins
- Kubernetes

## Features

- Add student
- View students
- Delete student
- REST API
- MySQL persistence
- Docker container
- Kubernetes deployment
- Kubernetes Service
- Kubernetes Secret
- PersistentVolumeClaim
- GitHub Actions validation
- Jenkins Docker build and push

## Local Build

Go into backend:

cd backend

Build:

mvn clean package

Run:

mvn spring-boot:run

Open:

http://localhost:8080

## Docker Build

From the project directory:

docker build -t YOUR_DOCKERHUB_USERNAME/student-management:latest ./backend

Run:

docker run -p 8080:8080 \
  -e DB_URL="jdbc:mysql://host.docker.internal:3306/studentdb" \
  -e DB_USERNAME="student" \
  -e DB_PASSWORD="student123" \
  YOUR_DOCKERHUB_USERNAME/student-management:latest

## Kubernetes Deployment

Create namespace:

kubectl apply -f k8s/namespace.yaml

Create secret:

kubectl apply -f k8s/secret.yaml

Create storage:

kubectl apply -f k8s/mysql-pvc.yaml

Deploy MySQL:

kubectl apply -f k8s/mysql-deployment.yaml

Create MySQL Service:

kubectl apply -f k8s/mysql-service.yaml

Deploy application:

kubectl apply -f k8s/app-deployment.yaml

Create application Service:

kubectl apply -f k8s/app-service.yaml

Check Pods:

kubectl get pods -n student-management

Check Services:

kubectl get svc -n student-management

Check Deployments:

kubectl get deployments -n student-management

## Access Application

For Minikube:

minikube service student-management-service \
  -n student-management

For a regular Kubernetes cluster:

kubectl get svc -n student-management

Use the NodePort shown by Kubernetes.

## GitHub Actions

GitHub Actions performs:

1. Checkout
2. Java setup
3. Maven tests
4. Maven build
5. Kubernetes manifest validation

## Jenkins

Jenkins performs:

1. Checkout
2. Maven tests
3. Docker image build
4. Docker Hub login
5. Docker image push
6. Kubernetes deployment
7. Deployment rollout verification