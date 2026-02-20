import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';

/**
 * AdopterAuth
 * 
 * Authentication page for adopters.
 * Allows users to sign in or create an account.
 * 
 * On successful authentication, sets a demo session
 * and navigates to the main menu.
 * @returns {JSX.Element}
 */
export default function AdopterAuth() {
    const navigate = useNavigate();
    const { setSession } = useAuth();
    const [isSignIn, setIsSignIn] = useState(true);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    /**
     * handleSubmit
     * 
     * Handles adopter login form submission.
     * Validates input and sets a demo session.
     * 
     * @param {React.FormEvent<HTMLFormElement>} e
     * @returns 
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email || !password) {
            alert('Please enter email and password');
            return;
        }

        // Store authenticated session using AuthContext
        setSession(
            { email, role: 'adopter' },
            'demo-token-adopter'
        );

        // Redirect to new adopter menu route
        navigate('/adopter-menu');
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
                    Find your perfect furry companion. Every pet deserves a loving home, and every home deserves a loyal friend.
                </p>
                <ul>
                    <li>Swipe through adorable pets looking for their forever home</li>
                    <li>Connect with local shelters and rescue organizations</li>
                    <li>Make a match and change a life</li>
                </ul>
            </div>

            <div className="right">
                <Link to="/">Change user type</Link>
                <h2>Welcome to PawfectMatch</h2>
                <p>Start your journey to find your perfect pet</p>

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
                    <label htmlFor="adopter-email">Email</label>
                    <input
                        id="adopter-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label htmlFor="adopter-password">Password</label>
                    <input
                        id="adopter-password"
                        type="password"
                        placeholder="******"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {isSignIn && (
                        <div className="checkbox">
                            <input id="remember-adopter" type="checkbox"/>
                            <label htmlFor="remember-adopter">Remember Me</label>
                        </div>
                    )}

                    <button type="submit">
                        {isSignIn ? 'Sign In as Adopter' : 'Create Adopter Account'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', padding: '10px', background: '#fff9e6', borderRadius: '6px', fontSize: '12px' }}>
                    Demo Mode: Click the button to access the app directly
                </div>
                <div style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
                    <a href="/adopter-menu" style={{ color: '#999', textDecoration: 'none' }}>Skip to adopter main menu</a>
                </div>
            </div>
        </div>
    );
}
