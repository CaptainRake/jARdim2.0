import { Routes, Route } from 'react-router-dom';

import Splash from './pages/Splash';
import Enter from './pages/Enter';
import Login from './pages/Login';
import Home from './pages/Home';
import AR from './pages/AR';
import Discovery from './pages/Discovery';
import Guide from './pages/Guide';
import Backpack from './pages/Backpack';
import Challenges from './pages/Challenges';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/enter" element={<Enter />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/ar" element={<AR />} />
      <Route path="/discovery" element={<Discovery />} />
      <Route path="/guide" element={<Guide />} />
      <Route path="/backpack" element={<Backpack />} />
      <Route path="/challenges" element={<Challenges />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}