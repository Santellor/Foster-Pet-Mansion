//dependency imports
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

//component imports
import Register from './Register.jsx'

export default function Login() {
    //state variables
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showRegister, setShowRegister] = useState(false)

    //redux store variables
    const userId = useSelector((state) => state.userId)
    const loggedIn = useSelector((state) => state.loggedIn)

    //action declarations
    const dispatch = useDispatch()
    const navigate = useNavigate()

    //handle login function
    const handleLogin = async (e) => {
        e.preventDefault()

        const body = {
            username: username,
            password: password
        }

        const res = await axios.post('/api/login', body)

        if (res.data.success) {
            dispatch({
                type: "USER_AUTH",
                payload: {
                    userId: res.data.userId,
                    username: res.data.username
                }
            })

            setUsername("")
            setPassword("")
            navigate("/mansion")
        }
    }

    //handle logout function
    const handleLogout = async () => {
        const res = await axios.get('/api/logout')

        if (res.data.success) {
            dispatch({
                type: "LOGOUT"
            })
        }
    }

    //session check function
    const sessionCheck = async () => {
        const res = await axios.get('/api/session-check')

        if (res.data.success) {
            dispatch({
                type: "USER_AUTH",
                payload: {
                    userId: res.data.userId,
                    username: res.data.username,
                    loggedIn: true
                }
            })
        }
    }

    useEffect(() => {
        sessionCheck()
    }, [])

    //html rendering
    return showRegister ? (
        <Register setShowRegister={setShowRegister} />
    ) : (
        <div>
            <nav>
                <h1>{loggedIn ? "" : "Login"}</h1>
            </nav>
                {!userId && 
                    <>
                        <button onClick={() => setShowRegister(true)}>Register a new account</button>
                    </>
                }
            {!userId &&
                <form  onSubmit={handleLogin}>
                    <input 
                        type='text' 
                        value={username} 
                        placeholder='Username' 
                        onChange={(e) => setUsername(e.target.value)}
                        />
                    <input 
                        type='password'
                        value={password}
                        placeholder='Password'
                        onChange={(e) => setPassword(e.target.value)}
                        />
                    <input 
                        type='submit'
                        />
                </form>
            }
            {userId && 
                <>
                    <h3>Welcome, {username}</h3>
                    <button onClick={handleLogout}>Logout</button>
                </>
            }
        </div>
    )
}