
pipeline {

    agent any

    tools {
        jdk 'JDK21'
        maven 'Maven3'
    }

    environment {
        MYSQL_CONTAINER = 'student-management-mysql'
        MYSQL_DATABASE = 'studentdb'
        MYSQL_USER = 'student'
        MYSQL_PASSWORD = 'studentpassword'
        MYSQL_ROOT_PASSWORD = 'rootpassword'
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
                    echo "========================================"
                    echo "JAVA"
                    echo "========================================"
                    java -version

                    echo ""
                    echo "========================================"
                    echo "MAVEN"
                    echo "========================================"
                    mvn -version

                    echo ""
                    echo "========================================"
                    echo "DOCKER"
                    echo "========================================"
                    docker --version
                '''
            }
        }

        stage('Start MySQL') {
            steps {
                sh '''
                    echo "========================================"
                    echo "STARTING MYSQL"
                    echo "========================================"

                    docker rm -f ${MYSQL_CONTAINER} 2>/dev/null || true

                    docker run -d --name ${MYSQL_CONTAINER} -e MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD} -e MYSQL_DATABASE=${MYSQL_DATABASE} -e MYSQL_USER=${MYSQL_USER} -e MYSQL_PASSWORD=${MYSQL_PASSWORD} -p ${MYSQL_PORT}:3306 mysql:8.0

                    echo "MySQL container started."
                    echo "Waiting for MySQL..."

                    MYSQL_READY=false

                    for i in $(seq 1 30); do
                        if docker exec ${MYSQL_CONTAINER} mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} -e "SELECT 1;" >/dev/null 2>&1; then
                            MYSQL_READY=true
                            echo "MySQL is ready and authentication works!"
                            break
                        fi

                        echo "Attempt $i/30: MySQL is not ready yet..."
                        sleep 2
                    done

                    if [ "$MYSQL_READY" != "true" ]; then
                        echo "========================================"
                        echo "MYSQL FAILED TO START"
                        echo "========================================"

                        docker ps -a --filter name=${MYSQL_CONTAINER}

                        echo ""
                        echo "MYSQL LOGS:"
                        docker logs ${MYSQL_CONTAINER}

                        exit 1
                    fi

                    echo ""
                    echo "========================================"
                    echo "MYSQL DATABASE"
                    echo "========================================"

                    docker exec ${MYSQL_CONTAINER} mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} -e "SHOW DATABASES;"
                '''
            }
        }

        stage('Test') {
            steps {
                dir('backend') {
                    sh '''
                        echo "========================================"
                        echo "TESTING MYSQL CONNECTION"
                        echo "========================================"

                        docker exec ${MYSQL_CONTAINER} mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} -e "SELECT 1;"

                        echo ""
                        echo "MySQL connection successful!"

                        echo ""
                        echo "========================================"
                        echo "RUNNING MAVEN TESTS"
                        echo "========================================"

                        mvn clean test -Dspring.datasource.url=jdbc:mysql://127.0.0.1:3306/${MYSQL_DATABASE} -Dspring.datasource.username=${MYSQL_USER} -Dspring.datasource.password=${MYSQL_PASSWORD}
                    '''
                }
            }

            post {
                always {
                    dir('backend') {
                        sh '''
                            echo ""
                            echo "========================================"
                            echo "SUREFIRE REPORTS"
                            echo "========================================"

                            if [ -d target/surefire-reports ]; then

                                find target/surefire-reports -type f -print

                                echo ""
                                echo "========================================"
                                echo "TEST DETAILS"
                                echo "========================================"

                                for file in target/surefire-reports/*.txt; do
                                    if [ -f "$file" ]; then
                                        echo ""
                                        echo "========================================"
                                        echo "FILE: $file"
                                        echo "========================================"
                                        cat "$file"
                                    fi
                                done

                            else
                                echo "No Surefire reports found."
                            fi
                        '''
                    }
                }
            }
        }

        stage('Build') {
            steps {
                dir('backend') {
                    sh '''
                        echo "========================================"
                        echo "BUILDING APPLICATION"
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

        stage('Build Docker Image') {
            steps {
                dir('backend') {
                    sh '''
                        echo "========================================"
                        echo "BUILDING DOCKER IMAGE"
                        echo "========================================"

                        docker build -t student-management:latest .

                        echo ""
                        echo "========================================"
                        echo "DOCKER IMAGE"
                        echo "========================================"

                        docker images student-management
                    '''
                }
            }
        }
    }

    post {

        always {
            sh '''
                echo "========================================"
                echo "CLEANING MYSQL"
                echo "========================================"

                docker rm -f ${MYSQL_CONTAINER} 2>/dev/null || true

                echo "MySQL container cleanup completed."
            '''
        }

        success {
            echo "========================================"
            echo "PIPELINE SUCCESS"
            echo "========================================"
            echo "Student Management pipeline completed successfully!"
        }

        failure {
            echo "========================================"
            echo "PIPELINE FAILED"
            echo "========================================"
            echo "Check the failed stage above."
        }
    }
}

