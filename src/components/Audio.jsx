import { useEffect, useState, useRef } from 'react';
import { Howl } from 'howler';
import { useSelector } from 'react-redux';

const Audio = ({ location }) => {
  const muted = useSelector((state) => state.muted);
  const soundPlaying = useSelector((state) => state.soundPlaying);
  const [isRacing, setIsRacing] = useState(false)
  const soundRef = useRef(null); // Ref to hold the Howl instance

  // 
  const locationHandler = () => {
    if (location.pathname !== '/mansion') {
      setIsRacing(true)
    } else {
      setIsRacing(false)
    }
  }

  useEffect(() => {
    locationHandler()
  }, [location.pathname])

  // Audio file matching
  const matchAudio = () => {
    
    if ((location.pathname === '/field_race' ) || 
        (location.pathname === '/ocean_race' ) || 
        (location.pathname === '/forest_race')) {
      return '/race.mp3'
    } else {
      return '/mansion.mp3';
    }
  };

  useEffect(() => {
    console.log(matchAudio())
    console.log(soundPlaying)
    console.log(isRacing)
    if (soundPlaying) {
      console.log(`attempting`)
      soundRef.current = new Howl({
        src: [matchAudio()],
        autoplay: true,
        loop: true,
        volume: 0.5, // Example volume control
        mute: muted,
      });
    } else {
      // Pause and unload the sound if not playing
      if (soundRef.current) {
        soundRef.current.pause();
        soundRef.current.unload();
      }
    }

    return () => {
      // Clean up Howl instance on unmount
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, [isRacing, muted, soundPlaying]);

  const togglePlay = () => {
    if (soundRef.current) {
      if (soundRef.current.playing()) {
        soundRef.current.pause();
      } else {
        soundRef.current.play();
      }
    }
  };

  return null;
};

export default Audio;
