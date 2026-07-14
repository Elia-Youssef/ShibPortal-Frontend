#!/bin/sh
set -e

if [ ${ENVIRONMENT} = "prod" ]
then
	KMS_KEY_ID="33d8285e-68cf-4d3d-8b0f-8f3b997a1e06"
	AWS_REGION="us-west-2"
else
	ENVIRONMENT=test
	KMS_KEY_ID="38a48322-da2d-4c58-b254-0e775d7965b3"
	AWS_REGION="ap-south-1"
fi

# AWS KMS decryption command
cat .env-${ENVIRONMENT}-encrypted |base64 -d >.env-${ENVIRONMENT}-encoded-encrypted
aws kms decrypt --ciphertext-blob fileb://.env-${ENVIRONMENT}-encoded-encrypted --output text --query Plaintext  --region ${AWS_REGION} --key-id ${KMS_KEY_ID} |base64 -d >.env

# Execute the command passed as arguments or the default CMD
exec "$@"
