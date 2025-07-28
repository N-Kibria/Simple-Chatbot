import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Motivational from './pages/Motivational';
import Romantic from './pages/Romantic';
import Funny from './pages/Funny';
import Sad from './pages/sad';
import './index.css';
import Happy from './pages/Happy';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/motivational" element={<Motivational />} />
      <Route path="/romantic" element={<Romantic />} />
      <Route path="/funny" element={<Funny />} />
      <Route path="/sad" element={<Sad />} />
      <Route path='/happy'element={<Happy/>}/>
    </Routes>
  </BrowserRouter>
);
