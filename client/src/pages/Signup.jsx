import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
    const { handleSignup } = useContext(AuthContext);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleSignup(formData);
        alert("Signup successful! Please log in.");
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
            <button type="submit">Signup</button>
        </form>
    );
};

export default Signup;
