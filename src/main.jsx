//dependency imports
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import store from './redux/store.js'
import { Provider } from 'react-redux'

//page imports
import Login from './components/Login.jsx'
import Register from './components/Register.jsx';
import Mansion from './components/Mansion.jsx';
import Race from './components/Race.jsx'
import Swim from './components/Swim.jsx'
import Bike from './components/Bike.jsx'

//browser router
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
        <Route index element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mansion" element={<Mansion />} />
        <Route path="/field_race" element={<Race />} />
        <Route path="/ocean_race" element={<Swim />} />
        <Route path="/forest_race" element={<Bike />} />
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);
