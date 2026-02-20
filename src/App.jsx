import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserTypeSelection from './pages/UserTypeSelection';
import AdopterAuth from './pages/AdopterAuth';
import ShelterAuth from './pages/ShelterAuth';
import AdopterMainMenu from './pages/AdopterMainMenu';
import ShelterMainMenu from './pages/ShelterMainMenu';
import AdopterPreferencesForm from './pages/AdopterPreferencesForm';
import AnimalProfileForm from './pages/AnimalProfileForm';
import AdopterContactPage from './pages/AdopterContactPage';
import ShelterContactPage from './pages/ShelterContactPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserTypeSelection />} />
        <Route path="/adopter" element={<AdopterAuth />} />
        <Route path="/shelter" element={<ShelterAuth />} />
        <Route path="/adopter-menu" element={<AdopterMainMenu />} />
        <Route path="/shelter-menu" element={<ShelterMainMenu />} />
        <Route path="/preferences" element={<AdopterPreferencesForm />} />
        <Route path="/animal/new" element={<AnimalProfileForm />} />
        <Route path="/adopter-contact" element={<AdopterContactPage />} />
        <Route path="/shelter-contact" element={<ShelterContactPage />} />
      </Routes>
    </Router>
  );
}

export default App;
