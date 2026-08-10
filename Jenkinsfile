```groovy
pipeline {

    agent any

    tools {
        jdk 'JDK21'
        maven 'Maven-3.9.16'
    }

    environment {
        MYSQL_CONTAINER = 'student-management-mysql'
        MYSQL_DATABASE = 'studentdb'
        MYSQL_USER = 'student'
        MYSQL_PASSWORD = 'studentpassword'
        MYSQL_PORT = '3306'
    }

    stages {

        /*
         * ==========================================
         * CHECKOUT
         * ==========================================
         */
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        /*
         * ==========================================
         * VERIFY JAVA / MAVEN / DOCKER
         * ==========================================
         */
        stage('Verify Tools') {
            steps {
                sh '''
                    echo "========================================"
                    echo "JAVA VERSION"
                    echo "========================================"
                    java -version

                    echo ""
                    echo "========================================"
                    echo "MAVEN VERSION"
                    echo "========================================"
                    mvn -version

                    echo ""
                    echo "========================================"
                    echo "DOCKER VERSION"
                    echo "========================================"
                    docker --version
                '''
            }
        }

        /*
         * ==========================================
         * START MYSQL
         * ==========================================
         */
        stage('Start MySQL') {
            steps {
                sh '''
                    echo "========================================"
                    echo "STARTING MYSQL"
                    echo "========================================"

                    # Remove an old container if it exists
                    docker rm -f ${MYSQL_CONTAINER} 2>/dev/null || true

                    # Start MySQL
                    docker run -d \
                      --name ${MYSQL_CONTAINER} \
                      -e MYSQL_ROOT_PASSWORD=rootpassword \
                      -e MYSQL_DATABASE=${MYSQL_DATABASE} \
                      -e MYSQL_USER=${MYSQL_USER} \
                      -e MYSQL_PASSWORD=${MYSQL_PASSWORD} \
                      -p ${MYSQL_PORT}:3306 \
                      mysql:8.0

                    echo ""
                    echo "MySQL container started."
                    echo "Waiting for MySQL to become ready..."

                    # Wait until MySQL accepts authenticated connections
                    for i in $(seq 1 30); do

                        if docker exec ${MYSQL_CONTAINER} \
                            mysql \
                            -u${MYSQL_USER} \
                            -p${MYSQL_PASSWORD} \
                            -e "SELECT 1;" \
                            ${MYSQL_DATABASE} >/dev/null 2>&1; then

                            echo ""
                            echo "========================================"
                            echo "MYSQL IS READY"
                            echo "========================================"

                            break
                        fi

                        echo "Attempt $i/30: MySQL not ready yet..."
                        sleep 2

                        if [ "$i" -eq 30 ]; then
                            echo ""
                            echo "========================================"
                            echo "MYSQL FAILED TO START"
                            echo "========================================"

                            echo ""
                            echo "===== MYSQL CONTAINER STATUS ====="
                            docker ps -a --filter name=${MYSQL_CONTAINER}

                            echo ""
                            echo "===== MYSQL LOGS ====="
                            docker logs ${MYSQL_CONTAINER}

                            exit 1
                        fi
                    done

                    echo ""
                    echo "========================================"
                    echo "MYSQL DATABASE CHECK"
                    echo "========================================"

                    docker exec ${MYSQL_CONTAINER} \
                        mysql \
                        -u${MYSQL_USER} \
                        -p${MYSQL_PASSWORD} \
                        -e "SHOW DATABASES;"

                    echo ""
                    echo "MySQL setup completed successfully."
                '''
            }
        }

        /*
         * ==========================================
         * TEST SPRING BOOT APPLICATION
         * ==========================================
         */
        stage('Test') {
            steps {
                dir('backend') {
                    sh '''
                        echo "========================================"
                        echo "TESTING MYSQL CONNECTION"
                        echo "========================================"

                        docker exec ${MYSQL_CONTAINER} \
                            mysql \
                            -u${MYSQL_USER} \
                            -p${MYSQL_PASSWORD} \
                            -e "SELECT 1;" \
                            ${MYSQL_DATABASE}

                        echo ""
                        echo "MySQL connection successful!"

                        echo ""
                        echo "========================================"
                        echo "RUNNING MAVEN TESTS"
                        echo "========================================"

                        mvn clean test \
                          -Dspring.datasource.url=jdbc:mysql://127.0.0.1:3306/${MYSQL_DATABASE} \
                          -Dspring.datasource.username=${MYSQL_USER} \
                          -Dspring.datasource.password=${MYSQL_PASSWORD}
                    '''
                }
            }
        }

        /*
         * ==========================================
         * BUILD SPRING BOOT JAR
         * ==========================================
         */
        stage('Build') {
            steps {
                dir('backend') {
                    sh '''
                        echo "========================================"
                        echo "BUILDING SPRING BOOT APPLICATION"
                        echo "========================================"

                        mvn clean package -DskipTests

                        echo ""
                        echo "========================================"
                        echo "BUILD OUTPUT"
                        echo "========================================"

                        ls -lh target/
                    '''
                }
            }
        }

        /*
         * ==========================================
         * BUILD DOCKER IMAGE
         * ==========================================
         */
        stage('Build Docker Image') {
            steps {
                dir('backend') {
                    sh '''
                        echo "========================================"
                        echo "BUILDING DOCKER IMAGE"
                        echo "========================================"

                        docker build \
                          -t student-management:latest \
                          .

                        echo ""
                        echo "========================================"
                        echo "DOCKER IMAGE CREATED"
                        echo "========================================"

                        docker images student-management
                    '''
                }
            }
        }
    }

    /*
     * ==========================================
     * POST ACTIONS
     * ==========================================
     */
    post {

        always {
            sh '''
                echo "========================================"
                echo "CLEANING UP MYSQL"
                echo "========================================"

                docker rm -f ${MYSQL_CONTAINER} 2>/dev/null || true

                echo "MySQL container removed."
            '''
        }

        success {
            echo "========================================"
            echo "PIPELINE SUCCESS"
            echo "========================================"
            echo "Student Management application built successfully!"
        }

        failure {
            echo "========================================"
            echo "PIPELINE FAILED"
            echo "========================================"
            echo "Check the stage that failed above."
        }
    }
}
```
