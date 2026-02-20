import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';

/**
 * ShelterAuth
 * 
 * Authentication page for shelters.
 * Hadnles sign in and account creation.
 * 
 * On successful authentication, sets a demo session
 * and navigates to the main menu.
 * 
 * @returns {JSX.Element}
 */
export default function ShelterAuth() {
    const navigate = useNavigate();
    const { setSession } = useAuth();
    const [isSignIn, setIsSignIn] = useState(true);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    /**
     * handleSubmit
     * 
     * Handles shleter login form submission.
     * Validates input and sets a demo session.
     * 
     * @param {React.FormEvent<HTMLFormElement} e 
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email || !password) {
            alert('Please enter email and password');
            return;
        }

        setSession(
            { email, role: 'shelter' },
            'demo-token-shelter'
        );

        navigate('/menu');
    };

    return (
        <div className="container">
            <div className="left">
                <h1>PawfectMatch</h1>
                <p>
                    Help pets find their forever homes. Manage adoptions, list pets, and connect with adopters looking for their new companions.
                </p>
                <ul>
                    <li>List available pets</li>
                    <li>Manage adoption applications</li>
                    <li>Connect with adopters easily</li>
                </ul>
            </div>

            <div className="right">
                <Link to="/">Change user type</Link>
                <h2>Welcome to PawfectMatch</h2>
                <p>Help pets find their forever homes</p>

                <div className="auth-tabs">
                    <button 
                        type="button"
                        className={isSignIn ? 'active' : ''}
                        onClick={() => setIsSignIn(true)}
                    >
                        Sign In
                    </button>
                    <button 
                        type="button"
                        className={!isSignIn ? 'active' : ''}
                        onClick={() => setIsSignIn(false)}
                    >
                        Create Account
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="shelter-email">Email</label>
                    <input 
                        id="shelter-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label htmlFor="shelter-password">Password</label>
                    <input
                        id="shelter-password"
                        type="password"
                        placeholder="*******"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {isSignIn && (
                        <div className="checkbox">
                            <input id="remember-shelter" type="checkbox"/>
                            <label htmlFor="remember-shelter">Remember me</label>
                        </div>
                    )}

                    <button type="submit">
                        {isSignIn ? 'Sign In as Shelter' : 'Create Shelter Account'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', padding: '10px', background: '#fff9e6', borderRadius: '6px', fontSize: '12px' }}>
                    Demo Mode: Click the button to access the app directly
                </div>
            </div>
        </div>
    );
}
