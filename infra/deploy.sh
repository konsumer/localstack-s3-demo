#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

export STACK=${STACK:-production}
export APP_AWS_REGION=${APP_AWS_REGION:-us-west-2}
export VERCEL_REGION=${VERCEL_REGION:-pdx1}

# use docker AWS-cli, for less things to manually install
function aws {
  docker run --rm -i --network=host -v ${HOME}/.aws:/root/.aws -v ${DIR}:${DIR} amazon/aws-cli --region ${APP_AWS_REGION} --output json $*
}

# get physical ID from resource logical ID
function getResourcePhysical {
  aws cloudformation list-stack-resources --stack-name "${STACK}" | "${DIR}/../node_modules/.bin/jqn" 'mapValues(filter(n => n.LogicalResourceId === "'${1}'")) | get(["StackResourceSummaries", 0, "PhysicalResourceId"])'
}

# grab AWS credentials for setting on vercel
eval $(node -r esm "${DIR}/prod_env.js")

# create or upte the stack, if needed
aws cloudformation create-stack --stack-name ${STACK} --template-body "file://${DIR}/cloudformation.yml" > /dev/null 2> /dev/null || aws cloudformation update-stack --stack-name ${STACK} --template-body "file://${DIR}/cloudformation.yml" > /dev/null 2> /dev/null

S3_BUCKET_IMAGE=$(getResourcePhysical "ImageBucket")

# deploy the web serivce on vercel
"${DIR}/../node_modules/.bin/vercel" deploy --prod --regions ${VERCEL_REGION} -e S3_BUCKET_IMAGE="${S3_BUCKET_IMAGE}" -e APP_AWS_REGION="${APP_AWS_REGION}" -e APP_AWS_ACCESS_KEY="${APP_AWS_ACCESS_KEY}" -e APP_AWS_ACCESS_SECRET="${APP_AWS_ACCESS_SECRET}"

# delete unaliased deploys
"${DIR}/../node_modules/.bin/vercel" rm -s -y localstack-s3-demo