import { useState, useEffect, useRef } from "react";
import { User } from "../../api";
import { Form, Submit, Button, Input } from "../Form";

export const EditAccount = (props) => {
    return (
        <>
            <AccountDetails {...props} />
            <EditPassword {...props} />
            <DeleteAccount {...props} />
        </>
    );
}

const AccountDetails = (props) => {
    const { user } = props;
    const [formData, setFormData] = useState(null);
    const [formError, setFormError] = useState({});
    const originalUsername = useRef(user.username);
    useEffect(() => {
        setFormData({
            firstName: user.firstName ?? '',
            lastName: user.lastName ?? '',
            username: user.username ?? '',
            email: user.email ?? ''
        });
    }, [user]);
    const updateFormData = (e) => setFormData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    const resetFormError = (e) => setFormError(prevState => {
        if (!prevState?.[e.target.name]) return prevState;
        const newState = {...prevState};
        delete newState[e.target.name];
        return newState;
    });
    const onSuccess = ({ user }) => {
        if (user.username !== originalUsername.current) {
            window.history.pushState('', '', `/d/${user.username}`);
            originalUsername.current = user.username;
        }
        props.refreshData();
    }
    const handleSubmit = () => User.editAccount(user._id, formData).then(onSuccess);
    const handleFormError = (errors) => setFormError({ ...errors });
    const inputHint = (inputName) => {
        if (formError?.[inputName]) return { type: 'error', message: formError[inputName] };
    }
    return (
        <Form {...props} onSubmit={handleSubmit} handleFormError={handleFormError}
              formData={formData}
              title="Edit account details"
              submit={<Submit value="Save changes" cancel={false} />}>
            <div className="formGrid">
                <Input type="text"
                    name="firstName"
                    label="First name:"
                    defaultValue={formData?.firstName}
                    onChange={updateFormData}
                    onInput={resetFormError}
                    hint={inputHint('firstName')} />
                <Input type="text"
                    name="lastName"
                    label="Last name:"
                    defaultValue={formData?.lastName}
                    onChange={updateFormData}
                    onInput={resetFormError}
                    hint={inputHint('lastName')} />
                <Input type="text"
                    name="email"
                    label="Email address:"
                    defaultValue={formData?.email}
                    onChange={updateFormData}
                    onInput={resetFormError}
                    hint={inputHint('email')} />
                <Input type="text"
                    name="username"
                    label="Username:"
                    defaultValue={formData?.username}
                    onChange={updateFormData}
                    onInput={resetFormError}
                    hint={inputHint('username')} />
            </div>
        </Form>
    );
}

const EditPassword = (props) => {
    const { user } = props;
    const [formReset, setFormReset] = useState(false);
    const [formData, setFormData] = useState({});
    const onSuccess = () => setTimeout(handleCancel, 1000);
    const handleSubmit = () => User.changePassword(user._id, formData);
    const updateFormData = (e) => {
        if (formReset) setFormReset(false);
        setFormData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    };
    const passwordsMatch = (() => {
        if (!formData.password || !formData.confirmPassword) return false;
        return formData.password === formData.confirmPassword;
    })();
    const handleCancel = () => {
        setFormData({});
        setFormReset(true);
    }
    return (
        <Form {...props} onSubmit={handleSubmit} onSuccess={onSuccess} handleFormError={handleCancel}
              reset={formReset}
              formData={formData}
              title="Change password"
              submit={<Submit value="Save changes" cancel={passwordsMatch ? handleCancel : false} disabled={!passwordsMatch} />}>
            <div className="formGrid">
                <Input type="password"
                    name="password"
                    label="Enter new password:"
                    onInput={updateFormData} />
                <Input type="password"
                    name="confirmPassword"
                    label="Confirm new password:"
                    onInput={updateFormData} />
            </div>
        </Form>
    );
}

const DeleteAccount = (props) => {
    const { user } = props;
    const onSuccess = () => window.location.assign('/');
    const handleDelete = () => User.deleteAccount(user._id);
    const confirmDeleteAccount = () => {
        const content = (
            <Form {...props} onSubmit={handleDelete} onSuccess={onSuccess}
                  title="Are you sure?"
                  submit={<Submit buttonClass="caution" value="Yes, I'm sure" cancel={props.gracefullyCloseModal} />}>
                If you proceed, any notes, settings, and other data associated with this account will be irrevocably lost. There is no going back from this!
            </Form>
        );
        props.updateModal(content);
    }
    return (
        <div className="deleteAccount">
            <h2>Delete my account</h2>
            <p>This will permanently delete all notes, settings, and other data associated with your account.</p>
            <div className="buttons">
                <Button type="button" className="caution smaller" onClick={confirmDeleteAccount}>Delete my account</Button>
            </div>
        </div>
    )
}

export const CreateAccount = (props) => {
    const { user } = props;
    const [formData, setFormData] = useState({});
    const [formError, setFormError] = useState({});
    const updateFormData = (e) => setFormData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    const resetFormError = (e) => setFormError(prevState => {
        if (!prevState?.[e.target.name]) return prevState;
        const newState = {...prevState};
        delete newState[e.target.name];
        return newState;
    });
    const onSuccess = ({ user }) => {
        window.history.pushState('', '', `/d/${user.username}`);
        props.refreshData();
    };
    const handleFormError = (errors) => setFormError({ ...errors });
    const handleSubmit = () => User.createAccount(user._id, formData).then(onSuccess);
    const inputHint = (inputName) => {
        if (formError?.[inputName]) return { type: 'error', message: formError[inputName] };
    }
    return (
        <Form {...props} onSubmit={handleSubmit} handleFormError={handleFormError}
              formData={formData}
              title="Create an account"
              submit={<Submit value="Save changes" cancel={false} />}>
            <p>It looks like you haven't registered an account yet. To customize your Dragonfly dashboard URL, password-protect your notes, and personalize your dashboard, create a free account below. Click <a href="/">here</a> to learn more.</p>
            <div className="formGrid formComponent">
                <Input type="text"
                    name="firstName"
                    label="First name:"
                    defaultValue={formData?.firstName}
                    onInput={resetFormError}
                    onChange={updateFormData}
                    hint={inputHint('firstName')} />
                <Input type="text"
                    name="lastName"
                    label="Last name:"
                    defaultValue={formData?.lastName}
                    onChange={updateFormData}
                    hint={inputHint('lastName')} />
            </div>
            <div className="formComponent">
                <Input type="text"
                    name="email"
                    label="Email address:"
                    defaultValue={formData?.email}
                    onInput={resetFormError}
                    onChange={updateFormData}
                    hint={inputHint('email')}
                    note={"For password recovery only. We'll never send you marketing emails or share your contact information with third parties."} />
            </div>
            <div className="formGrid formComponent">
                <Input type="text"
                    name="username"
                    label="Choose a username:"
                    defaultValue={formData?.username}
                    onInput={resetFormError}
                    onChange={updateFormData}
                    hint={inputHint('username')} />
                <Input type="password"
                    name="password"
                    label="Choose a password:"
                    defaultValue={formData?.password}
                    onInput={resetFormError}
                    onChange={updateFormData}
                    hint={inputHint('password')} />
            </div>
        </Form>
    );
}