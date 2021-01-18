import { useState } from 'react';
import Checkbox from './Checkbox';

export default function Login(props) {
    const [password, updatePassword] = useState('');
    const [invalidPassword, updateInvalidPassword] = useState(false);
    const handleLogin = async (e) => {
        e.preventDefault();
        const response = await fetch('/login/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: props.user.username,
                password
            })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) {
            console.log('no success: true response from server');
            if (body.error && body.error === 'invalid-password') return updateInvalidPassword(true);
        }
        window.location.reload();
    }
    const handleInput = (value) => {
        if (invalidPassword) updateInvalidPassword(false);
        updatePassword(value);
    }
    return (
        <div className="Login">
            <form onSubmit={handleLogin} autoComplete="off">
                <h1 className="display">Dragonfly</h1>
                <div className="passwordProtected">
                    <i className="giantIcon fas fa-lock"></i>
                    <p>This user's notes are protected.</p>
                </div>
                <div>
                    <label htmlFor="password">Enter password:</label>
                    <input type="password" className={invalidPassword ? ' nope' : ''} name="password" onChange={(e) => handleInput(e.target.value)} />
                </div>
                <div className="formCheck">
                    <Checkbox name="rememberThisDevice" label="Remember this device" checkboxFirst={true} defaultChecked={false} />
                </div>
                <div className="buttons">
                    <button>Submit</button>
                </div>
            </form>
        </div>
    )
}