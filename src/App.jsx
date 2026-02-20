import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserTypeSelection from './pages/UserTypeSelection';
import AdopterAuth from './pages/AdopterAuth';
import ShelterAuth from './pages/ShelterAuth';
import MainMenu from './pages/MainMenu';
import AdopterPreferencesForm from './pages/AdopterPreferencesForm';
import AnimalProfileForm from './pages/AnimalProfileForm';
import ContactPage from './pages/ContactPage';
import RoleGuard from './auth/RoleGuard.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<UserTypeSelection />} />
        <Route path="/adopter" element={<AdopterAuth />} />
        <Route path="/shelter" element={<ShelterAuth />} />

        {/* Authed Routes*/}
        <Route
          path="/menu"
          element={
            <RoleGuard allowRoles={["adopter", "shelter"]}>
              <MainMenu />
            </RoleGuard>
          }
        />

        {/* Adopter-Only Routes */}
        <Route
          path="/preferences"
          element={
            <RoleGuard allowRoles={["adopter"]}>
              <AdopterPreferencesForm />
            </RoleGuard>
          }
        />

        {/* Shelter-Only Routes */}
        <Route
          path="/animal/new"
          element={
            <RoleGuard allowRoles={["shelter"]}>
              <AnimalProfileForm />
            </RoleGuard>
          }
        />

        {/* Authed */}
        <Route
          path="/contact"
          element={
            <RoleGuard allowRoles={["adopter", "shelter"]}>
              <ContactPage />
            </RoleGuard>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
