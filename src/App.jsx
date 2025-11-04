import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import UserTypeSelection from './pages/UserTypeSelection';
import AdopterAuth from './pages/AdopterAuth';
import ShelterAuth from './pages/ShelterAuth';
import './App.css'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<UserTypeSelection />} />
                <Route path="/adopter" element={<AdopterAuth />} />
                <Route path="/shelter" element={<ShelterAuth />} />
            </Routes>
        </Router>
    );
}

export default App;