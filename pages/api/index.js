// this is server-side API in 1 endpoint

import AWS from 'aws-sdk'

const { AWS_ENDPOINT, APP_AWS_REGION = 'us-west-2', S3_BUCKET_IMAGE, APP_AWS_ACCESS_KEY, APP_AWS_ACCESS_SECRET } = process.env

AWS.config.update({
  endpoint: AWS_ENDPOINT,
  region: APP_AWS_REGION,
  accessKeyId: APP_AWS_ACCESS_KEY,
  secretAccessKey: APP_AWS_ACCESS_SECRET
})

const s3 = new AWS.S3()

const getUploadUrl = (params) => new Promise((resolve, reject) => {
  s3.getSignedUrl('putObject', params, (err, url) => {
    if (err) return reject(err)
    resolve(url)
  })
})

// return pre-signed URL for a Key
export default async (req, res) => {
  if (req.method === 'POST') {
    const { ContentType = 'application/octet-stream', Key } = req.body
    const s3Params = {
      Bucket: S3_BUCKET_IMAGE,
      Key,
      ContentType,
      ACL: 'public-read'
    }
    const signedUrl = await getUploadUrl(s3Params)
    console.log({ signedUrl, S3_BUCKET_IMAGE, ContentType, Key })
    res.send(signedUrl)
  } else {
    return res.send('Nothing to see here.')
  }
}
