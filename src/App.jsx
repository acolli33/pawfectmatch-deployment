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

        {/* Adopter Routes */}
        <Route
          path="/adopter-menu"
          element={
            <RoleGuard allowRoles={["adopter"]}>
              <AdopterMainMenu />
            </RoleGuard>
          }
        />

        <Route
          path="/preferences"
          element={
            <RoleGuard allowRoles={["adopter"]}>
              <AdopterPreferencesForm />
            </RoleGuard>
          }
        />

        <Route
          path="/adopter-contact"
          element={
            <RoleGuard allowRoles={["adopter"]}>
              <AdopterContactPage />
            </RoleGuard>
          }
        />

        {/* Shelter Routes */}
        <Route
          path="/shelter-menu"
          element={
            <RoleGuard allowRoles={["shelter"]}>
              <ShelterMainMenu />
            </RoleGuard>
          }
        />

        <Route
          path="/animal/new"
          element={
            <RoleGuard allowRoles={["shelter"]}>
              <AnimalProfileForm />
            </RoleGuard>
          }
        />

        <Route
          path="/shelter-contact"
          element={
            <RoleGuard allowRoles={["shelter"]}>
              <ShelterContactPage />
            </RoleGuard>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;