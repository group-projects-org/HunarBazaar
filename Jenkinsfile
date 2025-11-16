pipeline {
    agent any

    environment {
        IMAGE_NAME = "hunarbaazar-backend"
        CONTAINER_NAME = "hunarbaazar"
        DOCKERHUB_USER = "khajan_bhatt"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'master', url: 'https://github.com/group-projects-org/HunarBazaar.git'
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat '''
                    call npm install
                    call npm run build
                    '''
                }
            }
        }

        stage('Start Docker') {
            steps {
                powershell '''
                $ErrorActionPreference = "SilentlyContinue"

                Write-Host "Checking if Docker is running..."

                $isRunning = docker info 2>$null

                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ Docker is already running."
                    exit 0
                }

                Write-Host "⚙️ Docker not running. Starting Docker Desktop..."
                Start-Process "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe"

                Write-Host "⏳ Waiting for Docker daemon to start..."

                $maxTries = 20
                for ($i = 0; $i -lt $maxTries; $i++) {
                    docker info 2>$null
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "✅ Docker is ready!"
                        exit 0
                    }
                    Write-Host "Docker not ready yet ($i/$maxTries)..."
                    Start-Sleep -Seconds 5
                }

                Write-Host "❌ Docker did not start in time."
                exit 1
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %IMAGE_NAME% .'
            }
        }

        stage('Run Unit Tests') {
            steps {
                bat '''
                docker run --rm %IMAGE_NAME% sh -c "pytest /app/tests --maxfail=1 --disable-warnings -q"
                '''
            }
        }

        stage('Push to DockerHub') {
            when { branch 'master' }
            steps {
                withCredentials([string(credentialsId: 'dockerhub-token', variable: 'DOCKERHUB_PASS')]) {
                    bat '''
                    echo %DOCKERHUB_PASS% | docker login -u %DOCKERHUB_USER% --password-stdin
                    docker tag %IMAGE_NAME% %DOCKERHUB_USER%/%IMAGE_NAME%:latest
                    docker push %DOCKERHUB_USER%/%IMAGE_NAME%:latest
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sshagent(['your-ec2-ssh-key']) {
                    bat '''
                    ssh -o StrictHostKeyChecking=no ubuntu@your-server-ip ^
                        "docker pull %DOCKERHUB_USER%/%IMAGE_NAME%:latest && ^
                        docker stop %CONTAINER_NAME% || true && ^
                        docker rm %CONTAINER_NAME% || true && ^
                        docker run -d --name %CONTAINER_NAME% -p 8000:8000 %DOCKERHUB_USER%/%IMAGE_NAME%:latest"
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline completed."
        }
    }
}