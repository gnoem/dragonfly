import "./Login.css";
import { User } from "api";
import { useFormData, useFormError } from "hooks";
import { Form, Submit, Input } from "../Form";
import { Header } from "../Page";
import { Checkbox } from "../Checkbox";

export const Login = ({ username, loginWarning, updateAccessToken }) => {
    return (
        <div className="Login">
            <Header onClick={() => window.location.assign('/')} />
            {loginWarning
                ? <div>
                    <i className="giantIcon fas fa-question"></i>
                    User <b>{username}</b> not found!
                    </div>
                : <LoginForm {...{ username, updateAccessToken }} />}
        </div>
    );
}

const LoginForm = ({ username, updateAccessToken }) => {
    const [formData, updateFormData] = useFormData({});
    const [updateFormError, resetFormError, warnFormError] = useFormError({});
    const handleSubmit = () => User.login(username, formData);
    const handleSuccess = () => updateAccessToken(true);
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
                hint={warnFormError('password')} />
            <div className="formCheck">
                <Checkbox name="rememberThisDevice" label="Remember this device" checkboxFirst={true} defaultChecked={false} />
            </div>            
        </Form>
    );
}