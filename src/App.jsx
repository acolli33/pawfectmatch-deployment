import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserTypeSelection from './pages/UserTypeSelection';
import AdopterAuth from './pages/AdopterAuth';
import ShelterAuth from './pages/ShelterAuth';
import MainMenu from './pages/MainMenu';
import AdopterPreferencesForm from './pages/AdopterPreferencesForm';
import AnimalProfileForm from './pages/AnimalProfileForm';
import ContactPage from './pages/ContactPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserTypeSelection />} />
        <Route path="/adopter" element={<AdopterAuth />} />
        <Route path="/shelter" element={<ShelterAuth />} />
        <Route path="/menu" element={<MainMenu />} />
        <Route path="/preferences" element={<AdopterPreferencesForm />} />
        <Route path="/animal/new" element={<AnimalProfileForm />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </Router>
  );
}

export default App;
