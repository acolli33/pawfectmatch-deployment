import { Link } from "react-router-dom";

export default function ShelterAuth() {
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

                    <button type="submit">Sign In as Shelter</button>
                </form>
            </div>
        </div>
    );
}