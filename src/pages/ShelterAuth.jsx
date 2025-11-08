import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function ShelterAuth() {
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
