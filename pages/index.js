import { storage } from "../utils/firebase"
import { deleteObject, getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage"
import { useEffect, useState } from "react"

export default function Home() {
  const [file, setFile] = useState(null)
  const [name, setName] = useState('')
  const [images, setImages] = useState([])
  const [reload, setReload] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!file) {
      return
    }

    const storageRef = ref(storage, `Images/${`${file.name}-${Date.now()}-${Math.round(Math.random() * 1e9)}`}`)

    uploadBytes(storageRef, file)
      .then((res) => {
        setFile(null)
        setReload(!reload)
        console.log(res)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  function handleChange(e) {
    setFile(new File([e.target.files[0]], Date.now()))
  }

  async function deleteFromFirebase(e) {
    e.preventDefault()

    if (!name) {
      return
    }

    const fileRef = ref(storage, `Images/${name}`)

    deleteObject(fileRef)
      .then(() => {
        setReload(!reload)
        console.log('File deleted successfully')
      })
      .catch((err) => {
        console.log(err)
      })
  }

  function copyOfUrl(url) {
    navigator.clipboard.writeText(url)
  }

  useEffect(() => {
    const imagesRef = ref(storage, 'Images')

    listAll(imagesRef)
      .then((res) => {
        let promises = res.items.map((item) => {
          return [item.name, getDownloadURL(item)]
        })

        const names = promises.map((arr) => arr[0])
        promises = promises.map((arr) => arr[1])

        Promise.all(promises)
          .then((urls) => {
            setImages(
              urls.map((url, index) => {
                return {
                  'url': url,
                  'name': names[index]
                }
              })
            )
          })
          .catch((err) => {
            console.log(err)
          })
      })
      .catch((err) => {
        console.log(err)
      })
  }, [reload])

  return (
    <>
      <div>
        <div className="media-upload-container">
          <div>
            <form onSubmit={(e) => handleSubmit(e)}>
              <div className="upload">
                <label htmlFor="file-input" className={file ? "green" : "red"}>CHOOSE A FILE TO UPLOAD.</label>
                <input id="file-input" type="file" onChange={(e) => handleChange(e)} />
              </div>
              <button type="submit">UPLOAD</button>
            </form>
          </div>
          <div>
            <form onSubmit={(e) => deleteFromFirebase(e)}>
              <div className="upload">
                <input type="text" onChange={(e) => setName(e.target.value)} placeholder="Click on ( Image ) then paste" />
              </div>
              <button type="submit">DELETE</button>
            </form>
          </div>
        </div>
        <div className="images">
          {
            images.map((obj, index) => {
              return (
                <div className="copy-image-url" key={index} onClick={() => copyOfUrl(obj.name)}>
                  <img src={obj.url} alt="image" />
                </div>
              )
            })
          }
        </div>
      </div >
    </>
  )
}
