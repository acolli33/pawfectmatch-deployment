import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function AdopterAuth() {
    const navigate = useNavigate();
    const [isSignIn, setIsSignIn] = useState(true);

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/menu');
    };

    return (
        <div className="container">
            <div className="left">
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
                        className={isSignIn ? 'active' : ''}
                        onClick={() => setIsSignIn(true)}
                    >
                        Sign In
                    </button>
                    <button 
                        className={!isSignIn ? 'active' : ''}
                        onClick={() => setIsSignIn(false)}
                    >
                        Create Account
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <label>Email</label>
                    <input type="email" placeholder="you@example.com" required />

                    <label>Password</label>
                    <input type="password" placeholder="******" required />

                    {isSignIn && (
                        <div className="checkbox">
                            <input type="checkbox"/>
                            <span>Remember me</span>
                        </div>
                    )}

                    <button type="submit">
                        {isSignIn ? 'Sign In as Adopter' : 'Create Adopter Account'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', padding: '10px', background: '#fff9e6', borderRadius: '6px', fontSize: '12px' }}>
                    Demo Mode: Click the button to access the app directly
                </div>
            </div>
        </div>
    );
}
