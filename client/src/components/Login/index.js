import { useState } from 'react';
import Checkbox from '../Checkbox';
import { Form, Submit, Input } from '../Form';
import { User } from '../../api';
import { Header } from '../Page';

export const Login = (props) => {
    const { username, loginWarning } = props;
    return (
        <div>
            <Header onClick={() => window.location.assign('/')} />
            {loginWarning
                ? <div>
                    <i className="giantIcon fas fa-question"></i>
                    User <b>{username}</b> not found!
                    </div>
                : <LoginForm {...props} />}
        </div>
    );
}

const LoginForm = (props) => {
    const { username } = props;
    const [formError, setFormError] = useState({});
    const [formData, setFormData] = useState({});
    const updateFormData = (e) => setFormData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    const resetFormError = (e) => setFormError(prevState => {
        if (!prevState?.[e.target.name]) return prevState;
        const newState = {...prevState};
        delete newState[e.target.name];
        return newState;
    });
    const handleSubmit = () => User.login(username, formData);
    const onSuccess = () => props.updateAccessToken(true);
    const handleFormError = (errors) => setFormError({ ...errors });
    const inputHint = (inputName) => {
        if (formError?.[inputName]) return { type: 'error', message: formError[inputName] };
    }
    return (
        <Form {...props} onSubmit={handleSubmit} onSuccess={onSuccess} handleFormError={handleFormError}
              submit={<Submit cancel={false} />}>
            <div className="passwordProtected">
                <i className="lockIcon fas fa-lock"></i>
                <p>This user's notes are protected.</p>
            </div>
            <Input
                type="password"
                name="password"
                label="Enter password:"
                onChange={updateFormData}
                onInput={resetFormError}
                hint={inputHint('password')} />
            <div className="formCheck">
                <Checkbox name="rememberThisDevice" label="Remember this device" checkboxFirst={true} defaultChecked={false} />
            </div>            
        </Form>
    );
}