import { useState, useEffect, useRef } from "react";
import { User } from "../../helpers";
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
    const didUsernameChange = (newUsername) => {
        if (newUsername !== originalUsername.current) window.history.pushState('', '', `/d/${newUsername}`);
    }
    const handleSubmit = () => User.editAccount(props, user._id, formData).then(user => didUsernameChange(user.username));
    const updateFormData = (e) => setFormData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    return (
        <Form {...props} onSubmit={handleSubmit}
              formData={formData}
              title="Edit account details"
              submit={<Submit value="Save changes" cancel={false} />}>
            <div className="formGrid">
                <Input type="text"
                    name="firstName"
                    label="First name:"
                    defaultValue={formData?.firstName}
                    onChange={updateFormData} />
                <Input type="text"
                    name="lastName"
                    label="Last name:"
                    defaultValue={formData?.lastName}
                    onChange={updateFormData} />
                <Input type="text"
                    name="email"
                    label="Email address:"
                    defaultValue={formData?.email}
                    onChange={updateFormData} />
                <Input type="text"
                    name="username"
                    label="Username:"
                    defaultValue={formData?.username}
                    onChange={updateFormData} />
            </div>
        </Form>
    );
}

const EditPassword = (props) => {
    const { user } = props;
    const [formReset, setFormReset] = useState(false);
    const [formData, setFormData] = useState({});
    const [formError, setFormError] = useState({});
    const callback = () => setTimeout(handleCancel, 1000);
    const handleSubmit = () => User.changePassword(props, user._id, formData, callback);
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
        <Form {...props} onSubmit={handleSubmit} reset={formReset}
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
    const handleDelete = () => {};
    const confirmDeleteAccount = () => {
        const content = (
            <Form onSubmit={handleDelete}
                  title="Are you sure?"
                  submit={<Submit buttonClass="caution" value="Yes, I'm sure" />}>
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
    const [formData, setFormData] = useState({});
    const [formError, setFormError] = useState({});
    const handleSubmit = () => {};
    return (
        <Form {...props} onSubmit={handleSubmit}
              formData={formData}
              title="Create an account"
              submit={<Submit value="Save changes" cancel={false} />}>
             title, children, submit, formData, onSubmit, onSuccess
            form here
        </Form>
    );
}