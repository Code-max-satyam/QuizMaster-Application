import React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Login from './components/Login';
import Signup from './components/Signup';
import MyResultPage from './pages/MyResultPage';

// private protected route
function RequireAuth({ children }) {
  const isLoggedIn = Boolean(localStorage.getItem('authToken'))
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  return children;
}

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<Signup />} />

      <Route path='/result'
        element={
          <RequireAuth>
            <MyResultPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
};

export default App;