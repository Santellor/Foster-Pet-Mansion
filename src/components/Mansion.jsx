import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useDispatch } from 'react-redux'


const Mansion = () => {

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const handleLogout = async () => {
        const res = await axios.get('/api/get_logout')

        if (res.data.success) {
            dispatch({
                type: "LOGOUT"
            })

            navigate('/')
        }
    }



  return (
    <div>
        <div>Mansion</div>
        <button onClick={handleLogout}>log out</button>
    </div>
  )
}

export default Mansion