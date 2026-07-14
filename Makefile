DOCKER_IMAGE_NAME = shibportal-fe
DOCKER_CONTAINER_NAME = shibportal-fe

# Default Docker image tag
DEFAULT_TAG := latest
DEFAULT_NEXT_PUBLIC_ENV_NAME := production

# Default KMS Key
PROD_KMS_KEY_ID := 33d8285e-68cf-4d3d-8b0f-8f3b997a1e06
STAGE_KMS_KEY_ID := 38a48322-da2d-4c58-b254-0e775d7965b3
STAGE_AWS_REGION := ap-south-1
PROD_AWS_REGION := us-west-2

# Get the Docker image tag from the environment variable, or use the default
IMAGE_TAG ?= $(DEFAULT_TAG)

# Get the NEXT_PUBLIC_ENV_NAME from the environment variable, or use the default
NEXT_PUBLIC_ENV_NAME ?= $(DEFAULT_NEXT_PUBLIC_ENV_NAME)

get-deps:
	npm install --force

stage-encryption:
	aws kms encrypt --key-id ${STAGE_KMS_KEY_ID} --plaintext fileb://.env-test --output text --query CiphertextBlob --region ${STAGE_AWS_REGION} >.env-test-encrypted

prod-encryption:
	aws kms encrypt --key-id ${PROD_KMS_KEY_ID} --plaintext fileb://.env-prod --output text --query CiphertextBlob --region ${PROD_AWS_REGION} >.env-prod-encrypted

stage-decryption:
	cat .env-test-encrypted |base64 --decode >.env-test-encoded-encrypted
	aws kms decrypt --ciphertext-blob fileb://.env-test-encoded-encrypted --output text --query Plaintext  --region ${STAGE_AWS_REGION} --key-id ${STAGE_KMS_KEY_ID}|base64 -d >.env

prod-decryption:
	cat .env-prod-encrypted |base64 --decode >.env-prod-encoded-encrypted
	aws kms decrypt --ciphertext-blob fileb://.env-prod-encoded-encrypted --output text --query Plaintext  --region ${PROD_AWS_REGION} --key-id ${PROD_KMS_KEY_ID}|base64 -d >.env

build:
	npm run build

docker-build:
	docker build -t $(DOCKER_IMAGE_NAME):$(IMAGE_TAG) .

docker-run:
	docker run -d --name $(DOCKER_CONTAINER_NAME) -p 3000:3000 $(DOCKER_IMAGE_NAME)

docker-clean:
	docker stop $(DOCKER_CONTAINER_NAME) || true
	docker rm $(DOCKER_CONTAINER_NAME) || true

clean:
	rm -rf node_modules
	rm -rf coverage
	rm -rf dist

help:
	@echo "Usage: make [target]"
	@echo "Targets:"
	@echo "  get-deps       Install project dependencies"
	@echo "  test           Run tests"
	@echo "  build          Build the application"
	@echo "  docker-build   Build Docker image"
	@echo "  docker-run     Run Docker container"
	@echo "  docker-stop    Stop and remove Docker container"
	@echo "  clean          Clean up generated files"