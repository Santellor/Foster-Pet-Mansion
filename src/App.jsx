import { Outlet, useNavigate } from 'react-router-dom'
import axios from 'axios'

import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'

export default function App() {

  const dispatch = useDispatch()
  const navigate = useNavigate()

// global session check function
  const sessionCheck = async () => {
    const res = await axios.get('/api/get_session_check')

    if (res.data.success) {
        dispatch({
            type: "USER_AUTH",
            payload: {
                userId: res.data.userId,
                username: res.data.username,
                loggedIn: true
            }
        })
    } else {
      navigate ("/")
    }
}

useEffect(() => {
    sessionCheck()
}, [])

  return (
    <div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}