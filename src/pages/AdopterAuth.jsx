import { Link } from "react-router-dom";

export default function AdopterAuth() {
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
                    <button className="active">Sign In</button>
                    <button>Create Account</button>
                </div>

                <form>
                    <label>Email</label>
                    <input type="email" placeholder="you@example.com" />

                    <label>Password</label>
                    <input type="password" placeholder="******" />

                    <div className="checkbox">
                        <input type="checkbox"/>
                        <span>Remember me</span>
                    </div>

                    <button type="submit">Sign In as Adopter</button>
                </form>
            </div>
        </div>
    );
}