import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const { user, handleLogout } = useContext(AuthContext);

    return (
        <div>
            {user ? (
                <>
                    <h1>Welcome, {user.username}</h1>
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <h1>Please login or signup</h1>
            )}
        </div>
    );
};

export default Home;
