import { useNavigate } from 'react-router-dom';

export default function UserTypeSelection() {
    const navigate = useNavigate();

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
                    Connecting loving homes with pets in need. Whether you are here to adopt or work with a shelter to help pets find homes, we're here to help make a difference.
                </p>
                <ul>
                    <li>For adopters: Find your perfect furry companion</li>
                    <li>For shelters: Showcase pets and manage adoptions</li>
                    <li>Together, we can save lives and create happy families</li>
                </ul>
            </div>

            <div className="right">
                <h2>Welcome to PawfectMatch</h2>
                <p>Let's get started! Tell us who you are.</p>

                <div className="card-container">
                    <div className="card" onClick={() => navigate('/adopter')}>
                        <h3>I'm Looking to Adopt</h3>
                        <p>
                            Browse available pets, connect with shelters, and find your perfect companion.
                        </p>
                        <button>Continue as Adopter</button>
                    </div>

                    <div className="card" onClick={() => navigate('/shelter')}>
                        <h3>I'm a Shelter</h3>
                        <p>
                            List pets, manage adoption applications, and help animals find loving homes.
                        </p>
                        <button>Continue as Shelter</button>
                    </div>
                </div>

                <div style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
                    <a href="/menu" style={{ color: '#999', textDecoration: 'none' }}>Skip to main menu</a>
                </div>
            </div>
        </div>
    );
}
