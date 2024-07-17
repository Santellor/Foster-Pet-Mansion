import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { useSelector } from 'react-redux';

const Audio = ({ location }) => {
  const muted = useSelector((state) => state.muted);
  const soundPlaying = useSelector((state) => state.soundPlaying);
  const soundRef = useRef(null); // Ref to hold the Howl instance

  // Audio file matching
  const matchAudio = () => {
    if (location.pathname === '/mansion') {
      return '/mansion.mp3';
    }
    if (location.pathname === '/field_race' || location.pathname === '/ocean_race' || location.pathname === '/forest_race') {
      return '/race.mp3'
    }
    return '';
  };

  useEffect(() => {
    if (soundPlaying) {
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
  }, [location.pathname, muted, soundPlaying]);

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
