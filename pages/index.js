/* global fetch, FileReader */
import React, { useState } from 'react'

const getSignedUrl = file => fetch('/api', {
  method: 'POST',
  body: JSON.stringify({ Key: file.name, ContentType: file.type }),
  headers: { 'content-type': 'application/json' }
}).then(r => r.text())

const readAsDataURL = file => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = e => resolve(e.target.result)
  reader.readAsDataURL(file)
})

const PageIndex = () => {
  const [images, setImages] = useState([])
  const [errors, setErrors] = useState([])

  const handleSubmit = async e => {
    e.preventDefault()
    const newImages = []
    const newErrors = []
    for (const file of e.target.file.files) {
      const signedUrl = await getSignedUrl(file)
      const r = await fetch(signedUrl, { method: 'PUT', body: file })
      if (r.status === 200) {
        newImages.push(await readAsDataURL(file))
      } else {
        newErrors.push(`Error (${r.status}) uploading ${file.name}`)
      }
    }
    setImages(newImages)
    setErrors(newErrors)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type='file' name='file' />
      <button type='submit'>upload</button>
      {errors.map((error, e) => (<div key={e} style={{ color: 'red' }}>{error}</div>))}
      {images.map((image, i) => <img key={i} src={image} />)}
    </form>
  )
}

export default PageIndex
