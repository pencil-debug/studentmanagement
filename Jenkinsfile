
pipeline {

    agent any

    tools {
        jdk 'JDK21'
        maven 'Maven-3.9.16'
    }

    environment {
        MYSQL_CONTAINER = 'student-management-mysql'
        MYSQL_NETWORK   = 'student-management-network'

        MYSQL_DATABASE  = 'studentdb'
        MYSQL_USER      = 'root'
        MYSQL_PASSWORD  = 'root'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Java and Maven') {
            steps {
                sh '''
                    echo "========================================"
                    echo "JAVA VERSION"
                    echo "========================================"
                    java -version

                    echo "========================================"
                    echo "MAVEN VERSION"
                    echo "========================================"
                    mvn -version

                    echo "========================================"
                    echo "DOCKER VERSION"
                    echo "========================================"
                    docker --version
                '''
            }
        }

        stage('Create Docker Network') {
            steps {
                sh '''
                    echo "========================================"
                    echo "CREATING DOCKER NETWORK"
                    echo "========================================"

                    docker network inspect ${MYSQL_NETWORK} >/dev/null 2>&1 || \
                    docker network create ${MYSQL_NETWORK}

                    echo "Docker network is ready:"
                    docker network inspect ${MYSQL_NETWORK}
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

                    docker run -d \
                        --name ${MYSQL_CONTAINER} \
                        --network ${MYSQL_NETWORK} \
                        -e MYSQL_ROOT_PASSWORD=${MYSQL_PASSWORD} \
                        -e MYSQL_DATABASE=${MYSQL_DATABASE} \
                        mysql:8.0

                    echo "MySQL container started."

                    echo "========================================"
                    echo "WAITING FOR MYSQL"
                    echo "========================================"

                    MYSQL_READY=false

                    for i in $(seq 1 60); do

                        if docker exec ${MYSQL_CONTAINER} \
                            mysqladmin ping \
                            -h 127.0.0.1 \
                            -uroot \
                            -p${MYSQL_PASSWORD} \
                            --silent; then

                            echo "MySQL is READY!"
                            MYSQL_READY=true
                            break
                        fi

                        echo "MySQL not ready yet... attempt ${i}/60"
                        sleep 2
                    done

                    if [ "$MYSQL_READY" != "true" ]; then
                        echo "ERROR: MySQL did not become ready."

                        echo "========================================"
                        echo "MYSQL LOGS"
                        echo "========================================"

                        docker logs ${MYSQL_CONTAINER}

                        exit 1
                    fi

                    echo "========================================"
                    echo "TESTING MYSQL DATABASE"
                    echo "========================================"

                    docker exec ${MYSQL_CONTAINER} \
                        mysql \
                        -h 127.0.0.1 \
                        -uroot \
                        -p${MYSQL_PASSWORD} \
                        -e "SELECT VERSION();"

                    docker exec ${MYSQL_CONTAINER} \
                        mysql \
                        -h 127.0.0.1 \
                        -uroot \
                        -p${MYSQL_PASSWORD} \
                        -e "SHOW DATABASES;"

                    echo "MySQL database is working."
                '''
            }
        }

        stage('Test') {
            steps {
                dir('backend') {
                    sh '''
                        echo "========================================"
                        echo "RUNNING SPRING BOOT TESTS"
                        echo "========================================"

                        mvn clean test \
                            -Dspring.datasource.url="jdbc:mysql://${MYSQL_CONTAINER}:3306/${MYSQL_DATABASE}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC" \
                            -Dspring.datasource.username="${MYSQL_USER}" \
                            -Dspring.datasource.password="${MYSQL_PASSWORD}" \
                            -Dspring.datasource.driver-class-name="com.mysql.cj.jdbc.Driver" \
                            -Dspring.jpa.hibernate.ddl-auto=update

                        echo "========================================"
                        echo "TESTS PASSED"
                        echo "========================================"
                    '''
                }
            }
        }

        stage('Build') {
            steps {
                dir('backend') {
                    sh '''
                        echo "========================================"
                        echo "BUILDING SPRING BOOT APPLICATION"
                        echo "========================================"

                        mvn clean package -DskipTests

                        echo "BUILD SUCCESSFUL"
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

                        docker build \
                            -t student-management:latest \
                            .

                        echo "DOCKER IMAGE BUILT"
                    '''
                }
            }
        }
    }

    post {

        always {
            sh '''
                echo "========================================"
                echo "SUREFIRE REPORTS"
                echo "========================================"

                if [ -d backend/target/surefire-reports ]; then
                    find backend/target/surefire-reports \
                        -type f \
                        -print
                else
                    echo "No Surefire reports found."
                fi

                echo "========================================"
                echo "MYSQL CLEANUP"
                echo "========================================"

                docker rm -f ${MYSQL_CONTAINER} 2>/dev/null || true

                echo "MySQL container removed."
            '''
        }

        success {
            echo '========================================'
            echo 'PIPELINE SUCCESS'
            echo '========================================'
        }

        failure {
            echo '========================================'
            echo 'PIPELINE FAILED'
            echo '========================================'
            echo 'Check the failed stage and logs above.'
        }
    }
}

