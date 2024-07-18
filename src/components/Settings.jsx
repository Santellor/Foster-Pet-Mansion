import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { TbPlayerPauseFilled } from "react-icons/tb";
import { TbPlayerPlayFilled } from "react-icons/tb";
import Audio from './Audio.jsx';

const Settings = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const username = useSelector((state) => state.username)
    const muted = useSelector((state) => state.muted)
    const soundPlaying = useSelector((state) => state.soundPlaying)

    const toggleMute = () => {
        dispatch({
            type: "VOLUME",
            payload: {muted: !muted, soundPlaying: soundPlaying},
        })
    }

    // returns to the login page and clears state
    const handleLogout = async () => {
        const res = await axios.get('/api/get_logout')
        if (res.data.success) {
            dispatch({
                type: "LOGOUT"
            })
            navigate('/')
        }
    }

    const toggleAudio = () => {
        dispatch({
            type: "VOLUME",
            payload: {muted: muted, soundPlaying: !soundPlaying},
        })
    }

    //<button onClick={toggleMute}>Turn sounds {muted ? "on" : "off"}</button>
    console.log(`locatstat`, location.state)
    return (
        <div className='flex justify-between content-center bg-primary-dark'>
            <div className=' flex justify-center content-center w-[18vw] text-md md:text-2xl sm:text-xl xs-lg text-primary dark my-2 ml-6 py-2 bg-primary-light text-primary-dark  hover:text-highlight border-2 border-primary-dark hover:border-highlight' onClick={toggleAudio}>
                Music:
                <button >{soundPlaying ? <TbPlayerPauseFilled /> : <TbPlayerPlayFilled />} </button>
            </div>
            <div className=' invisible sm:visible content-center text-primary-light text-3xl lg:text-5xl md:text-5xl sm:text-3xl'>
                {location.state !== null ? location.state.username : username}'s Mansion
            </div>
            {soundPlaying ? <Audio location={location} /> : ""}
            <button className=' flex justify-center content-center w-[18vw] text-md md:text-2xl sm:text-xl xs-lg text-primary dark my-2 mr-6 py-2 bg-primary-light text-primary-dark  hover:text-highlight border-2 border-primary-dark hover:border-highlight' onClick={handleLogout}>log out</button>
        </div>
    )
}

export default Settings