pipeline {
    agent any

    environment {
        // --- 🚨 Configuration Variables (Update these!) -----------------------
        DOCKERHUB_CREDENTIAL_ID = 'dockerhub-credentials'
        // Ensure you have updated 'soham008' if your Docker Hub username is different
        USER_REPO = 'soham008/user-service' 
        ORDER_REPO = 'soham008/order-service'
        
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
        // USER SERVICE PIPELINE
        // =======================================================================
        stage('2. Build User Service Image') {
            steps {
                echo "Building ${USER_REPO} image with tag: ${env.BUILD_NUMBER}"
                // FIX: Changed sh to bat for Windows compatibility
                bat "docker build -t ${USER_REPO}:${env.BUILD_NUMBER} ./user-service"
                bat "docker tag ${USER_REPO}:${env.BUILD_NUMBER} ${USER_REPO}:latest"
                echo "User Service Image Build Complete."
            }
        }
        
        // =======================================================================
        // ORDER SERVICE PIPELINE
        // =======================================================================
        stage('3. Build Order Service Image') {
            steps {
                echo "Building ${ORDER_REPO} image with tag: ${env.BUILD_NUMBER}"
                // FIX: Changed sh to bat for Windows compatibility
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
                    // FIX: Replaced sh with bat. We use a single multiline bat command for the login.
                    bat '''
                        echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                    '''

                    // Push User Service (FIX: Changed sh to bat)
                    bat "docker push ${USER_REPO}:${env.BUILD_NUMBER}"
                    bat "docker push ${USER_REPO}:latest"
                    
                    // Push Order Service (FIX: Changed sh to bat)
                    bat "docker push ${ORDER_REPO}:${env.BUILD_NUMBER}"
                    bat "docker push ${ORDER_REPO}:latest"
                    
                    bat 'docker logout'
                }
            }
        }
        
        // =======================================================================
        // DEPLOYMENT
        // =======================================================================
        stage('5. Deploy Containers') {
            steps {
                echo 'Deploying containers to target environment (Jenkins Host)...'
                
                // FIX: Use script block with try/catch to safely ignore cleanup errors on Windows
                script {
                    echo 'Attempting to clean up old containers...'
                    
                    // Cleanup User Service
                    try {
                        bat 'docker stop user-app'
                        bat 'docker rm user-app'
                    } catch (Exception ignored) {
                        echo 'User service container not found, continuing...'
                    }
                    
                    // Cleanup Order Service
                    try {
                        bat 'docker stop order-app'
                        bat 'docker rm order-app'
                    } catch (Exception ignored) {
                        echo 'Order service container not found, continuing...'
                    }
                }
                
                // 1. Deploy User Service
                bat "docker run -d --name user-app -p ${USER_PORT}:8081 ${USER_REPO}:${env.BUILD_NUMBER}"
                echo "User Service deployed and running on host port ${USER_PORT}"
                
                // 2. Deploy Order Service
                bat "docker run -d --name order-app -p ${ORDER_PORT}:8082 ${ORDER_REPO}:${env.BUILD_NUMBER}"
                echo "Order Service deployed and running on host port ${ORDER_PORT}"
            }
        }
        // =======================================================================
        // VERIFICATION
        // =======================================================================
        stage('6. Verify Deployment') {
            steps {
                echo 'Verifying services are running and accessible via host ports...'
                
                // Use PING command for a reliable 5-second delay on Windows
                bat 'ping 1.1.1.1 -n 6 > nul' 
                
                // FIX: Switch to the native PowerShell shell for reliable HTTP calls
                powershell '''
                    Write-Host "Testing User Service Health:"
                    # Invoke-WebRequest returns status code 200 on success
                    Invoke-WebRequest -Uri "http://localhost:8081/health" -Method GET | Out-Null
                    
                    Write-Host "Testing User Service Endpoint:"
                    # Get the actual JSON content from the User endpoint
                    Invoke-WebRequest -Uri "http://localhost:8081/users/123" -Method GET
                    
                    Write-Host "Testing Order Service Health:"
                    Invoke-WebRequest -Uri "http://localhost:8082/health" -Method GET | Out-Null
                    
                    Write-Host "Testing Order Service Endpoint:"
                    # Get the actual JSON content from the Order endpoint
                    Invoke-WebRequest -Uri "http://localhost:8082/orders/456" -Method GET
                    
                    Write-Host "Deployment verification successful! Services are running."
                '''
            }
        }
    }
}