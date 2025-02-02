import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import { Button } from '@/components/ui/button';

const Login = () => {
    const { handleLogin } = useContext(AuthContext);
    const navigate = useNavigate();  // Define navigate using useNavigate
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleLogin(formData);
        navigate('/notes');  // Redirect to /notes after login
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
            <Button type="submit">Login</Button>
        </form>
    );
};

export default Login;
