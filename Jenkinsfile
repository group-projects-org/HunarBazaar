pipeline {
    agent any

    environment {
        IMAGE_NAME = "hunarbaazar-backend"
        CONTAINER_NAME = "hunarbaazar"
        DOCKERHUB_USER = "khajan_bhatt"
    }

    stages {
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                    npm install
                    npm run build
                    '''
                }
            }
        }

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/group-projects-org/HunarBazaar.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_NAME .'
            }
        }

        stage('Run Unit Tests') {
            steps {
                sh '''
                docker run --rm $IMAGE_NAME pytest --maxfail=1 --disable-warnings -q
                '''
            }
        }

        stage('Push to DockerHub') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([string(credentialsId: 'dockerhub-token', variable: 'DOCKERHUB_PASS')]) {
                    sh '''
                    echo $DOCKERHUB_PASS | docker login -u $DOCKERHUB_USER --password-stdin
                    docker tag $IMAGE_NAME $DOCKERHUB_USER/$IMAGE_NAME:latest
                    docker push $DOCKERHUB_USER/$IMAGE_NAME:latest
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sshagent(['your-ec2-ssh-key']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no ubuntu@your-server-ip '
                        docker pull $DOCKERHUB_USER/$IMAGE_NAME:latest &&
                        docker stop $CONTAINER_NAME || true &&
                        docker rm $CONTAINER_NAME || true &&
                        docker run -d --name $CONTAINER_NAME -p 8000:8000 $DOCKERHUB_USER/$IMAGE_NAME:latest
                    '
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