import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import Audio from './Audio.jsx';

const Settings = () => {
    const muted = useSelector((state) => state.muted)
    const soundPlaying = useSelector((state) => state.soundPlaying)
    const dispatch = useDispatch()
    const location = useLocation()

    const toggleMute = () => {
        dispatch({
            type: "VOLUME",
            payload: {muted: !muted, soundPlaying: soundPlaying},
        })
    }

    const toggleAudio = () => {
        dispatch({
            type: "VOLUME",
            payload: {muted: muted, soundPlaying: !soundPlaying},
        })
    }

    //<button onClick={toggleMute}>Turn sounds {muted ? "on" : "off"}</button>
    return (
        <div>
            <p>Settings</p>
            <button onClick={toggleAudio}>{soundPlaying ? "Stop" : "Play"} sound</button>
            {soundPlaying ? <Audio location={location} /> : ""}
        </div>
    )
}

export default Settings