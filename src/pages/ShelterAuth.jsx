import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * ShelterAuth
 * 
 * Authentication page for shelters.
 * Handles sign in and account creation.
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

    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);

    /**
     * handleSubmit
     * 
     * Handles shelter login form submission.
     * Validates input and sets a demo session.
     * 
     * @param {React.FormEvent<HTMLFormElement>} e
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        if (!email || !password) {
            setSubmitError('Please enter email and password');
            return;
        }

        if (!isSignIn) {
            setSubmitError('Account creation is not available in this Alpha build. Use the provided test account.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/demo-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    role: 'shelter',
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.ok) {
                setSubmitError(result.error || 'Unable to sign in');
                return;
            }

            // Store authenticated session using AuthContext
            setSession(
                result.data.user,
                result.data.token
            );

            // Redirect to new shelter menu route
            navigate('/shelter-menu');
        } catch (error) {
            console.error('Shelter login failed:', error);
            setSubmitError('Unable to connect to the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="left">
                <div className="floating-images">
                <img src="images/dog_homepage.jpg" alt="dog" className="circle top-left" />
                <img src="images/cat_homepage.jpg" alt="cat" className="circle top-right" />
                <img src="images/dog2_homepage.jpg" alt="dog2" className="circle bottom-right" />
                </div>
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

                    {submitError && (
                        <div
                            style={{
                                marginTop: '12px',
                                padding: '10px 12px',
                                borderRadius: '6px',
                                border: '1px solid #dc2626',
                                background: '#fee2e2',
                                color: '#991b1b',
                                fontSize: '14px',
                            }}
                        >
                            {submitError}
                        </div>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading
                            ? 'Loading...'
                            : isSignIn
                                ? 'Sign In as Shelter'
                                : 'Create Shelter Account'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', padding: '10px', background: '#fff9e6', borderRadius: '6px', fontSize: '12px' }}>
                    Demo Mode: use a shelter email that already exists in Supabase (shelter@example.com)
                </div>
            </div>
        </div>
    );
}