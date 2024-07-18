import axios from 'axios'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  //state variables
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  //action declarations
  const dispatch = useDispatch()
  const navigate = useNavigate()

  //handle register function
  const handleRegister = async (e) => {
    e.preventDefault()

    const body = {
      username: username,
      email: email,
      password: password
    }
    await axios.post('/api/post_register', body)
    .then((res) => {
      console.log(`res`, res.data)
      if (res.data.success) {
        console.log(`user created: `, res.data.userId)
        dispatch({
          type: "USER_AUTH",
          payload: {
            userId: res.data.userId,
            username: res.data.username
          }
        })
        dispatch({
          type: "VOLUME",
          payload: {soundPlaying: false},
        })

        setUsername("")
        setPassword("")
        setEmail("")
        navigate("/mansion",{state:{userId: res.data.userId, username: res.data.username}})
      }
    })
  }

  //html rendering
  return (
    <div className='flex flex-col items-center text-center text-primary-light'>
            <nav className='flex flex-col items-center border-b-8 border-primary-light p-10 w-[100vw] text-3xl lg:text-6xl md:text-7xl sm:text-5xl bg-primary-dark'>
                <h1>FOSTER PET MANSION</h1>
            </nav>
      <form className='flex flex-col items-center my-10 bg-primary-dark pb-10 px-10' onSubmit={handleRegister}>
        <h1 className='text-2xl mb-2 p-2 pt-3 sm:text-4xl'>Register</h1>

        <input
          type='text'
          placeholder='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className='w-[42vw] text-xl mb-2 p-2 sm:text-3xl'
        />

        <input
          type='text'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='w-[42vw] text-xl my-2 p-2 sm:text-3xl'
        />

        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='w-[42vw] text-xl mt-2 p-2 sm:text-3xl'
        />

        <input className='w-[24vw] text-xl sm:text-3xl text-primary dark mt-4 py-2 px-1  bg-secondary-light text-primary-dark  hover:text-highlight border-2 border-primary-dark hover:border-highlight' type='submit' value='Done'/>
        <button className='w-[24vw]  text-xl sm:text-3xl text-primary dark mt-4 py-2 px-1  bg-secondary-light text-primary-dark  hover:text-highlight border-2 border-primary-dark hover:border-highlight' onClick={() => navigate('/')}>Back</button>
      </form>

    </div>
  )
}