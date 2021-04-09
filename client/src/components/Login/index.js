import "./Login.css";
import { User } from "../../api";
import { useFormData, useFormError } from "../../hooks";
import { Guest } from "../Guest";
import { Form, Submit, Input } from "../Form";
import { Checkbox } from "../Checkbox";
import { useEffect } from "react";

export const ValidateUser = () => {
    const [formData, updateFormData] = useFormData({});
    const [updateFormError, resetFormError, warnFormError] = useFormError({});
    const handleSubmit = () => User.validateUser(formData);
    const handleSuccess = ({ user }) => window.location.assign(`/d/${user.username}`);
    return (
        <Guest className="Login">
            <Form onSubmit={handleSubmit} onSuccess={handleSuccess} handleFormError={updateFormError}
                  loadingOnly={true}
                  submit={<Submit value="Continue" nvm="Back" cancel={() => window.location.assign('/')} />}>
                <Input
                    type="text"
                    name="identifier"
                    label="Username or email address:"
                    onChange={updateFormData}
                    onInput={resetFormError}
                    hint={warnFormError('identifier')}
                />
            </Form>
        </Guest>
    );
}

export const Login = ({ username, loginWarning, updateAccessToken, createModal }) => {
    return (
        <Guest className="Login">
            {loginWarning
                ? <div>
                    <i className="giantIcon fas fa-question"></i>
                    User <b>{username}</b> not found!
                    </div>
                : <LoginForm {...{ username, updateAccessToken, createModal }} />}
        </Guest>
    );
}

const LoginForm = ({ username, updateAccessToken, createModal }) => {
    const [formData, updateFormData] = useFormData({});
    const [updateFormError, resetFormError, warnFormError] = useFormError({});
    const handleSubmit = () => User.login(username, formData);
    const handleSuccess = () => updateAccessToken(true);
    const resetPassword = () => createModal('resetPassword', 'form');
    const forgotPassword = (
        <button type="button" className="stealth link" onClick={resetPassword}>Forgot your password?</button>
    );
    return (
        <Form onSubmit={handleSubmit} onSuccess={handleSuccess} handleFormError={updateFormError}
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
                hint={warnFormError('password')}
                note={forgotPassword} />
            <div className="formCheck">
                <Checkbox name="rememberThisDevice" label="Remember this device" checkboxFirst={true} defaultChecked={false} />
            </div>            
        </Form>
    );
}