import { useState, useRef } from 'react';
import Checkbox from '../Checkbox';

export const Login = (props) => {
    const { username } = props;
    const [formError, setFormError] = useState({});
    const [formData, setFormData] = useState({});
    const loginForm = useRef(null);
    const handleInput = (e) => {
        setFormData(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    }
    const handleLogin = async (e) => {
        e.preventDefault();
        const response = await fetch(`/login/${username}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const body = await response.json();
        if (!body.success) return setFormError(body.error);
        props.updateAccessToken(body.success);
    }
    return (
        <div className="Login" ref={loginForm}>
            <form onSubmit={handleLogin} autoComplete="off">
                <h1 className="display">Dragonfly</h1>
                <div className="passwordProtected">
                    <i className="giantIcon fas fa-lock"></i>
                    <p>This user's notes are protected.</p>
                </div>
                <div>
                    <label htmlFor="password">Enter password:</label>
                    <input type="password" className={formError?.password ? ' nope' : ''} name="password" onChange={handleInput} />
                </div>
                <div className="formCheck">
                    <Checkbox name="rememberThisDevice" label="Remember this device" checkboxFirst={true} defaultChecked={false} />
                </div>
                <div className="buttons">
                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>
    );
}