import { FaRegFaceSmile } from 'react-icons/fa6'
import { useEffect, useState } from 'react'

function App() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => prevCount + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <h1 className="text-5xl font-bold text-red-500">Hello world!</h1>
        <h2 className="flex gap-3 text-3xl font-bold text-red-500">
          <FaRegFaceSmile />
          <FaRegFaceSmile />
          <FaRegFaceSmile />
        </h2>
        <h2 className="text-3xl text-blue-500">{count}</h2>
      </div>
    </>
  )
}

export default App
