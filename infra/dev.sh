#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

export AWS_ENDPOINT=http://localhost:4566
export STACK=${STACK:-dev}
export APP_AWS_REGION=${APP_AWS_REGION:-us-west-2}

function onExit {
  docker kill $DOCKER_ID > /dev/null
}
trap onExit EXIT

# use docker AWS-cli, for less things to manually install
function aws {
  docker run --rm -i --network=host -v ${HOME}/.aws:/root/.aws -v ${DIR}:${DIR} amazon/aws-cli --endpoint-url=${AWS_ENDPOINT} --region ${APP_AWS_REGION} --output json $*
}

# get physical ID from resource logical ID
function getResourcePhysical {
  aws cloudformation list-stack-resources --stack-name "${STACK}" | "${DIR}/../node_modules/.bin/jq.node" 'mapValues(filter(n => n.LogicalResourceId === "'${1}'")) | get(["StackResourceSummaries", 0, "PhysicalResourceId"])'
}

# run local s3 & cloudformation
DOCKER_ID=$(docker run -d --rm --privileged --name "localstack-${STACK}" \
  -e LOCALSTACK_SERVICES=s3,cloudformation \
  -e DEBUG=1 \
  -e DEFAULT_REGION="${APP_AWS_REGION}" \
  -e LOCALSTACK_HOSTNAME="localhost" \
  -e DOCKER_HOST="unix:///var/run/docker.sock" -e HOST_TMP_FOLDER="/tmp/localstack" \
  -p 4566-4620:4566-4620 -p 12121:12121 -p 8080-8081:8080-8081  \
  -v "/tmp/localstack:/tmp/localstack" -v "/var/run/docker.sock:/var/run/docker.sock" \
  "localstack/localstack")

# wait for cloudformation, then create stack
echo -n "waiting for localstack cloudformation"
until aws cloudformation list-stacks > /dev/null; do
  echo -n "."
  sleep 3
done
aws cloudformation create-stack --stack-name ${STACK} --template-body "file://${DIR}/cloudformation.yml" > /dev/null

export S3_BUCKET_IMAGE=$(getResourcePhysical "ImageBucket")

# run the web serivce
"${DIR}/../node_modules/.bin/next" dev