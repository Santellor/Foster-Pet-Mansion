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

        const res = await axios.post('/api/post_login', body)

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

    //html rendering
    return (
        <div className='flex flex-col items-center text-primary-light'>
            <nav className='flex flex-col border-b-8 border-primary-light items-center p-10 w-[100vw] text-3xl lg:text-6xl md:text-7xl sm:text-5xl bg-primary-dark'>
                <h1>FOSTER PET MANSION</h1>
            </nav>
                
                
            
                <form className='flex flex-col items-center my-10 bg-primary-dark p-10' onSubmit={handleLogin}>
                    <div>
                        <button className='w-[42vw] text-xl sm:text-3xl text-primary dark mb-4 py-2 px-6  bg-secondary-light text-primary-dark  hover:text-highlight border-2 border-primary-dark hover:border-highlight' onClick={() => navigate("/register")}>New Account</button>
                    </div>
                    <input 
                        type='text' 
                        value={username} 
                        placeholder='Username' 
                        onChange={(e) => setUsername(e.target.value)}
                        className='w-[42vw] text-xl mb-2 p-2 sm:text-3xl'
                        />
                    <input 
                        type='password'
                        value={password}
                        placeholder='Password'
                        onChange={(e) => setPassword(e.target.value)}
                        className='w-[42vw] text-xl mt-2 p-2 sm:text-3xl'
                        />
                    <input 
                        type='submit'
                        value='Log In'
                        className='w-[24vw]  text-xl sm:text-3xl text-primary dark mt-4 py-2 px-1  bg-secondary-light text-primary-dark  hover:text-highlight border-2 border-primary-dark hover:border-highlight'
                        />
                </form>
        </div>
    )

}