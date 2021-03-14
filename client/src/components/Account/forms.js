import { useState } from "react";
import { Form, Submit, Input } from "../Form";

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
    const [formData, setFormData] = useState({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        username: user.username ?? '',
        email: user.email ?? ''
    });
    const [formError, setFormError] = useState({});
    const handleSubmit = () => {};
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
    const [formReset, setFormReset] = useState(false);
    const [formData, setFormData] = useState({});
    const [formError, setFormError] = useState({});
    const handleSubmit = () => {};
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
    const handleSubmit = () => {};
    return (
        <Form {...props} onSubmit={handleSubmit}
              formClass="horizontal"
              title="Delete my account"
              submit={<Submit buttonClass="caution" value="Delete my account" cancel={false} />}>
            <p>This will permanently delete all notes, settings, and other data associated with your account.</p>
        </Form>
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