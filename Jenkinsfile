pipeline {
    agent any

    environment {
        // --- 🚨 Configuration Variables (Update these!) -----------------------
        DOCKERHUB_CREDENTIAL_ID = 'dockerhub-credentials'
        // 🚨 IMPORTANT: Replace <your_credential> with your actual Docker Hub username
        USER_REPO = 'soham008/user-service' 
        ORDER_REPO = 'soham008/order-service'
        
        // Host ports for external access (remain 8081 and 8082)
        USER_PORT = '8081' 
        ORDER_PORT = '8082'
        // ----------------------------------------------------------------------
    }

    stages {
        stage('1. Checkout SCM') {
            steps {
                echo 'Checking out source code from SCM...'
                checkout scm
            }
        }

        // =======================================================================
        // BUILD STAGES (Assuming Dockerfiles are updated with EXPOSE 3001/3002 and npm install)
        // =======================================================================
        stage('2. Build User Service Image') {
            steps {
                echo "Building ${USER_REPO} image with tag: ${env.BUILD_NUMBER}"
                bat "docker build -t ${USER_REPO}:${env.BUILD_NUMBER} ./user-service"
                bat "docker tag ${USER_REPO}:${env.BUILD_NUMBER} ${USER_REPO}:latest"
                echo "User Service Image Build Complete."
            }
        }
        
        stage('3. Build Order Service Image') {
            steps {
                echo "Building ${ORDER_REPO} image with tag: ${env.BUILD_NUMBER}"
                bat "docker build -t ${ORDER_REPO}:${env.BUILD_NUMBER} ./order-service"
                bat "docker tag ${ORDER_REPO}:${env.BUILD_NUMBER} ${ORDER_REPO}:latest"
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
                    bat '''
                        echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                    '''

                    bat "docker push ${USER_REPO}:${env.BUILD_NUMBER}"
                    bat "docker push ${USER_REPO}:latest"
                    
                    bat "docker push ${ORDER_REPO}:${env.BUILD_NUMBER}"
                    bat "docker push ${ORDER_REPO}:latest"
                    
                    bat 'docker logout'
                }
            }
        }
        
        // =======================================================================
        // DEPLOYMENT (FIXED CONTAINER PORTS)
        // =======================================================================
        stage('5. Deploy Containers') {
            steps {
                echo 'Deploying containers to target environment (Jenkins Host)...'
                
                script {
                    echo 'Attempting to clean up old containers...'
                    try { bat 'docker stop user-app'; bat 'docker rm user-app' } catch (Exception ignored) { echo 'User service container not found, continuing...'}
                    try { bat 'docker stop order-app'; bat 'docker rm order-app' } catch (Exception ignored) { echo 'Order service container not found, continuing...'}
                }
                
                // 1. Deploy User Service: Maps Host Port 8081 -> Container Port 3001 (FIXED)
                bat "docker run -d --name user-app -p ${USER_PORT}:3001 ${USER_REPO}:${env.BUILD_NUMBER}"
                echo "User Service deployed and running on host port ${USER_PORT}"
                
                // 2. Deploy Order Service: Maps Host Port 8082 -> Container Port 3002 (FIXED)
                bat "docker run -d --name order-app -p ${ORDER_PORT}:3002 ${ORDER_REPO}:${env.BUILD_NUMBER}"
                echo "Order Service deployed and running on host port ${ORDER_PORT}"
            }
        }
        
        // =======================================================================
        // VERIFICATION (FIXED DELAY & ENDPOINTS)
        // =======================================================================
        stage('6. Verify Deployment') {
            steps {
                echo 'Verifying services are running and accessible via host ports...'
                
                // FIX: Increase delay to 10 seconds for service startup reliability
                bat 'ping 1.1.1.1 -n 11 > nul' 
                
                // Use PowerShell for reliable HTTP verification on Windows
                powershell '''
                    Write-Host "Testing User Service Root (Health Check /):"
                    # Root endpoint now serves as the basic health check
                    Invoke-WebRequest -Uri "http://localhost:8081/" -Method GET | Out-Null
                    
                    Write-Host "Testing User Service /users Endpoint:"
                    # New endpoint path
                    Invoke-WebRequest -Uri "http://localhost:8081/users" -Method GET
                    
                    Write-Host "Testing Order Service Root (Health Check /):"
                    Invoke-WebRequest -Uri "http://localhost:8082/" -Method GET | Out-Null
                    
                    Write-Host "Testing Order Service /orders Endpoint:"
                    # New endpoint path
                    Invoke-WebRequest -Uri "http://localhost:8082/orders" -Method GET
                    
                    Write-Host "Deployment verification successful! Services are running."
                '''
            }
        }
    }
}