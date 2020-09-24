import React from 'react'
import ReactS3Uploader from 'react-s3-uploader'

function getSignedUrl (file, callback) {
  window.fetch('/api', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ Key: file.name, ContentType: file.type }) })
    .then(r => r.text())
    .then(signedUrl => {
      console.log(`Got signed URL: ${signedUrl}`)
      callback({ signedUrl })
    })
}

const PageIndex = () => {
  const onProgress = (percent, message, file) => console.log(`Progress (${percent}%): ${message}`)
  const onError = console.error
  const onFinish = (...args) => console.log('FINISH', args)
  return (
    <div>
      <p>Choose an image to upload:</p>
      <ReactS3Uploader
        getSignedUrl={getSignedUrl}
        accept='image/*'
        onProgress={onProgress}
        onError={onError}
        onFinish={onFinish}
      />
    </div>
  )
}

export default PageIndex
