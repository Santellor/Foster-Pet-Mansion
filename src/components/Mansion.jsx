import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'


const Mansion = () => {

    const navigate = useNavigate()
    const handleLogout = async () => {
        navigate('/') // <-- delete this once you have back end routes
        const res = await axios.get('/api/logout')

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