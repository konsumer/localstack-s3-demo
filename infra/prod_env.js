// this will output env-vars for AWS

import AWS from 'aws-sdk'

console.log(`export APP_AWS_ACCESS_KEY="${AWS.config.credentials.accessKeyId}"`)
console.log(`export APP_AWS_ACCESS_SECRET="${AWS.config.credentials.secretAccessKey}"`)
