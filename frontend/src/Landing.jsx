import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from './api';
import { GoogleLogin } from '@react-oauth/google';
import './Landing.css';

const Landing = () => {
    const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'forgot'
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        mobile: '',
        password: '',
        token: '',
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');
        try {
            const response = await authApi.googleLogin(credentialResponse.credential);
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.error || 'Google Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (authMode === 'login') {
                const response = await authApi.login({
                    username: formData.username,
                    password: formData.password,
                });
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                navigate('/home');
            } else if (authMode === 'signup') {
                await authApi.signup(formData);
                setAuthMode('login');
                setMessage('Signup successful! Please login.');
            } else if (authMode === 'forgot') {
                const response = await authApi.forgotPassword(formData.email);
                setMessage(response.data.message);
                // For debug purposes in local mode:
                if (response.data.debug_token) {
                    console.log("Debug Reset Token:", response.data.debug_token);
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="landing-container">
            <div className="overlay"></div>
            <div className="auth-card glass">
                {authMode !== 'forgot' && (
                    <div className="tabs">
                        <button
                            className={authMode === 'login' ? 'active' : ''}
                            onClick={() => setAuthMode('login')}
                        >
                            Sign In
                        </button>
                        <button
                            className={authMode === 'signup' ? 'active' : ''}
                            onClick={() => setAuthMode('signup')}
                        >
                            Sign Up
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <h1>
                        {authMode === 'login' ? 'Sign In' :
                            authMode === 'signup' ? 'Sign Up' : 'Forgot Password'}
                    </h1>

                    {error && <div className="error-message">{error}</div>}
                    {message && <div className="success-message">{message}</div>}

                    {authMode !== 'forgot' && (
                        <div className="input-group">
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    {(authMode === 'signup' || authMode === 'forgot') && (
                        <div className="input-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    {authMode === 'signup' && (
                        <div className="input-group">
                            <input
                                type="text"
                                name="mobile"
                                placeholder="Mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                            />
                        </div>
                    )}

                    {authMode !== 'forgot' && (
                        <div className="input-group">
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Processing...' :
                            authMode === 'login' ? 'Sign In' :
                                authMode === 'signup' ? 'Sign Up' : 'Send Reset Link'}
                    </button>

                    {authMode === 'login' && (
                        <div className="forgot-password-link">
                            <span onClick={() => setAuthMode('forgot')}>Forgot Password?</span>
                        </div>
                    )}

                    {authMode === 'forgot' && (
                        <div className="back-to-login">
                            <span onClick={() => setAuthMode('login')}>Back to Sign In</span>
                        </div>
                    )}
                </form>

                {authMode === 'login' && (
                    <div className="social-auth">
                        <div className="divider">
                            <span>OR</span>
                        </div>
                        <div className="google-btn-container">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google Login Failed')}
                                theme="filled_black"
                                shape="pill"
                                text="signin_with"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Landing;
