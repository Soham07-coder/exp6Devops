// Complete Jenkins Pipeline for two Node.js Microservices
pipeline {
    agent any

    environment {
        // --- 🚨 Configuration Variables (Update these!) -----------------------
        
        // Credentials ID for Docker Hub set up in Jenkins
        DOCKERHUB_CREDENTIAL_ID = 'dockerhub-credentials'
        
        // Docker Hub Repository Names
        // 🚨 IMPORTANT: REPLACE 'your_dockerhub_user' with your actual Docker Hub username
        USER_REPO = 'soham008/user-service' 
        ORDER_REPO = 'soham008/order-service'
        
        // Define ports for deployment verification (access from outside the Jenkins host)
        USER_PORT = '8081'
        ORDER_PORT = '8082'
        // ----------------------------------------------------------------------
    }

    stages {
        stage('1. Checkout SCM') {
            steps {
                echo 'Checking out source code from SCM...'
                // Assumes this is a Pipeline script from SCM job
                checkout scm
            }
        }

        // =======================================================================
        // USER SERVICE PIPELINE
        // =======================================================================
        stage('2. Build User Service Image') {
            steps {
                echo "Building ${USER_REPO} image with tag: ${env.BUILD_NUMBER}"
                // Build the image using the Dockerfile inside the user-service directory
                sh "docker build -t ${USER_REPO}:${env.BUILD_NUMBER} ./user-service"
                // Create the 'latest' tag
                sh "docker tag ${USER_REPO}:${env.BUILD_NUMBER} ${USER_REPO}:latest"
                echo "User Service Image Build Complete."
            }
        }
        
        // =======================================================================
        // ORDER SERVICE PIPELINE
        // =======================================================================
        stage('3. Build Order Service Image') {
            steps {
                echo "Building ${ORDER_REPO} image with tag: ${env.BUILD_NUMBER}"
                // Build the image using the Dockerfile inside the order-service directory
                sh "docker build -t ${ORDER_REPO}:${env.BUILD_NUMBER} ./order-service"
                // Create the 'latest' tag
                sh "docker tag ${ORDER_REPO}:${env.BUILD_NUMBER} ${ORDER_REPO}:latest"
                echo "Order Service Image Build Complete."
            }
        }

        // =======================================================================
        // PUSH TO REGISTRY (DOCKER HUB)
        // =======================================================================
        stage('4. Login and Push Images') {
            steps {
                echo 'Authenticating with Docker Hub and pushing images...'
                withCredentials([usernamePassword(
                    credentialsId: DOCKERHUB_CREDENTIAL_ID,
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    // Secure Login: Pipes the password into docker login
                    sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"

                    // Push User Service
                    sh "docker push ${USER_REPO}:${env.BUILD_NUMBER}"
                    sh "docker push ${USER_REPO}:latest"
                    
                    // Push Order Service
                    sh "docker push ${ORDER_REPO}:${env.BUILD_NUMBER}"
                    sh "docker push ${ORDER_REPO}:latest"
                    
                    sh 'docker logout'
                }
            }
        }
        
        // =======================================================================
        // DEPLOYMENT
        // =======================================================================
        stage('5. Deploy Containers') {
            steps {
                echo 'Deploying containers to target environment (Jenkins Host)...'
                
                // Stop and remove old containers (ignore errors if they don't exist)
                sh 'docker stop user-app || true'
                sh 'docker rm user-app || true'
                sh 'docker stop order-app || true'
                sh 'docker rm order-app || true'
                
                // 1. Deploy User Service: Maps container port 8081 to host port 8081
                sh "docker run -d --name user-app -p ${USER_PORT}:8081 ${USER_REPO}:${env.BUILD_NUMBER}"
                echo "User Service deployed and running on host port ${USER_PORT}"
                
                // 2. Deploy Order Service: Maps container port 8082 to host port 8082
                sh "docker run -d --name order-app -p ${ORDER_PORT}:8082 ${ORDER_REPO}:${env.BUILD_NUMBER}"
                echo "Order Service deployed and running on host port ${ORDER_PORT}"
            }
        }
        
        // =======================================================================
        // VERIFICATION
        // =======================================================================
        stage('6. Verify Deployment') {
            steps {
                echo 'Verifying services are running and accessible via host ports...'
                
                // Give services a moment to start up
                sh 'sleep 5'
                
                // Verify User Service (using the exposed port 8081)
                echo 'Testing User Service Health:'
                sh "curl -s http://localhost:${USER_PORT}/health"
                echo 'Testing User Service Endpoint:'
                sh "curl -s http://localhost:${USER_PORT}/users/123"
                
                // Verify Order Service (using the exposed port 8082)
                echo 'Testing Order Service Health:'
                sh "curl -s http://localhost:${ORDER_PORT}/health"
                echo 'Testing Order Service Endpoint:'
                sh "curl -s http://localhost:${ORDER_PORT}/orders/456"

                echo 'Deployment verification successful! Services are running.'
            }
        }
    }
}