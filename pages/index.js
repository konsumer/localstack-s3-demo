/* global fetch, FileReader */
import React from 'react'

const getSignedUrl = file => fetch('/api', {
  method: 'POST',
  body: JSON.stringify({ Key: file.name, ContentType: file.type }),
  headers: { 'content-type': 'application/json' }
}).then(r => r.text())

const readFile = file => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = e => resolve(e.target.result)
  reader.readAsDataURL(file)
})

const handleSubmit = async e => {
  e.preventDefault()
  for (const file of e.target.file.files) {
    const signedUrl = await getSignedUrl(file)
    const r = await fetch(signedUrl, { method: 'PUT', body: await readFile(file) })
    console.log(r)
  }
}

const PageIndex = () => {
  return (
    <form onSubmit={handleSubmit}>
      <input type='file' name='file' />
      <button type='submit'>upload</button>
    </form>
  )
}

export default PageIndex
