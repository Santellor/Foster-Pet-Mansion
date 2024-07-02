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

        dispatch({
          type: "USER_AUTH",
          payload: res.data.userId
        })

        setUsername("")
        setPassword("")
        setEmail("")
        navigate("/mansion")
      }
    })
  }

  //html rendering
  return (
    <div id='register'>
      <form onSubmit={handleRegister}>
        <h1>Register</h1>

        <input
          type='text'
          placeholder='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type='text'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input type='submit' value='Register'/>
      </form>

      <button onClick={() => navigate('/')}>back</button>
    </div>
  )
}