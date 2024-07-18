import './index.css'
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import Settings from './components/Settings.jsx';

export default function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loggedIn = useSelector((state) => state.loggedIn);
  const [isLoaded, setIsLoaded] = useState(false);

  // Global session check function
  const sessionCheck = async () => {
    try {
      const res = await axios.get('/api/get_session_check');

      if (res.data.success) {
        dispatch({
          type: 'USER_AUTH',
          payload: {
            userId: res.data.userId,
            username: res.data.username,
            loggedIn: true,
          },
        });
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      navigate('/');
    }
  };

  useEffect(() => {
    sessionCheck();
    setIsLoaded(true);
  }, []);

  return (
    <div id='pixelify-sans-bingus-is-the-fastest-pet' className='bg-neutral h-[100vh]'>
      {loggedIn && isLoaded ? <Settings /> : ""}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
