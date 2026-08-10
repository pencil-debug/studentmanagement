pipeline {

    agent any

    environment {

        DOCKER_IMAGE = "YOUR_DOCKERHUB_USERNAME/student-management"
        DOCKER_CREDENTIALS = "dockerhub-credentials"

        KUBE_CREDENTIALS = "kubeconfig"

        NAMESPACE = "student-management"

    }

    stages {

        stage('Checkout') {

            steps {

                checkout scm
            }
        }


        stage('Test') {

            steps {

                dir('backend') {

                    sh 'mvn clean test'
                }
            }
        }


        stage('Build Docker Image') {

            steps {

                script {

                    dockerImage = docker.build(
                        "${DOCKER_IMAGE}:${BUILD_NUMBER}",
                        "./backend"
                    )
                }
            }
        }


        stage('Login and Push Docker Image') {

            steps {

                script {

                    docker.withRegistry(
                        'https://index.docker.io/v1/',
                        DOCKER_CREDENTIALS
                    ) {

                        dockerImage.push()

                        dockerImage.push('latest')
                    }
                }
            }
        }


        stage('Deploy to Kubernetes') {

            steps {

                withKubeConfig(
                    [credentialsId: KUBE_CREDENTIALS]
                ) {

                    sh '''
                        kubectl apply -f k8s/namespace.yaml

                        kubectl apply -f k8s/secret.yaml

                        kubectl apply -f k8s/mysql-pvc.yaml

                        kubectl apply -f k8s/mysql-deployment.yaml

                        kubectl apply -f k8s/mysql-service.yaml

                        kubectl apply -f k8s/app-deployment.yaml

                        kubectl apply -f k8s/app-service.yaml

                        kubectl -n ${NAMESPACE} \
                          set image deployment/student-management-app \
                          student-management=${DOCKER_IMAGE}:${BUILD_NUMBER}

                        kubectl -n ${NAMESPACE} \
                          rollout status deployment/student-management-app \
                          --timeout=180s
                    '''
                }
            }
        }

    }


    post {

        success {

            echo 'Student Management application deployed successfully!'
        }

        failure {

            echo 'Pipeline failed.'
        }
    }
}