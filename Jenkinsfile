```groovy
pipeline {

    agent any

    tools {
        jdk 'JDK21'
        maven 'Maven3'
    }

    environment {
        MYSQL_CONTAINER = 'student-management-mysql'
        MYSQL_DATABASE = 'studentdb'
        MYSQL_USER = 'root'
        MYSQL_PASSWORD = 'root'
        MYSQL_PORT = '3306'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Tools') {
            steps {
                sh '''
                    echo "===== Java ====="
                    java -version

                    echo "===== Maven ====="
                    mvn -version

                    echo "===== Docker ====="
                    docker --version
                '''
            }
        }

        stage('Start MySQL') {
            steps {
                sh '''
                    echo "Starting MySQL..."

                    docker rm -f ${MYSQL_CONTAINER} 2>/dev/null || true

                    docker run -d \
                      --name ${MYSQL_CONTAINER} \
                      -e MYSQL_ROOT_PASSWORD=${MYSQL_PASSWORD} \
                      -e MYSQL_DATABASE=${MYSQL_DATABASE} \
                      -p ${MYSQL_PORT}:3306 \
                      mysql:8.0

                    echo "Waiting for MySQL..."

                    for i in $(seq 1 30); do
                        if docker exec ${MYSQL_CONTAINER} \
                            mysqladmin ping \
                            -h localhost \
                            -uroot \
                            -proot \
                            --silent; then

                            echo "MySQL is ready!"
                            break
                        fi

                        echo "MySQL not ready yet..."
                        sleep 2
                    done

                    docker exec ${MYSQL_CONTAINER} \
                        mysqladmin ping \
                        -h localhost \
                        -uroot \
                        -proot
                '''
            }
        }

        stage('Test') {
            steps {
                dir('backend') {
                    sh '''
                        mvn clean test \
                          -Dspring.datasource.url=jdbc:mysql://localhost:3306/studentdb \
                          -Dspring.datasource.username=root \
                          -Dspring.datasource.password=root
                    '''
                }
            }
        }

        stage('Build') {
            steps {
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                dir('backend') {
                    sh '''
                        docker build \
                          -t student-management:latest \
                          .
                    '''
                }
            }
        }
    }

    post {

        always {
            sh '''
                echo "Cleaning up MySQL..."

                docker rm -f ${MYSQL_CONTAINER} 2>/dev/null || true
            '''
        }

        success {
            echo 'Student Management pipeline completed successfully!'
        }

        failure {
            echo 'Student Management pipeline failed.'
        }
    }
}
```
