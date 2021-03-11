import { useState, useRef } from 'react';
import Loading from '../Loading';

export default function MyAccount(props) {
    const { user } = props;
    return (
        <div className="Panel">
            {user.username
                ? <Account {...props} />
                : <CreateAccount {...props} />
            }
        </div>
    );
}

function Account(props) {
    const { user } = props;
    const [formData, updateFormData] = useState({ user });
    const [newPassword, updateNewPassword] = useState({ password: null, confirmPassword: null })
    const changePasswordForm = useRef(null);
    const modalContent = useRef(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('/edit/account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) {
            console.log('no success: true response from server');
            console.dir(body.errorReport);
            return;
        }
        const successModal = () => {
            const buttonContinue = () => {
                if (formData.username === user.username) {
                    props.updateIsLoaded(false);
                    props.gracefullyCloseModal(modalContent.current);
                    props.refreshData();
                    return;
                }
                props.updateIsLoaded(false);
                props.gracefullyCloseModal(modalContent.current);
                setTimeout(window.location.href = '/d/'+formData.username, 300);
            }
            const content = (
                <div className="modalContent" ref={modalContent}>
                    <h2>Success!</h2>
                    <p>Your changes were saved.</p>
                    <div className="buttons">
                        <button onClick={buttonContinue}>Continue</button>
                    </div>
                </div>
            )
            props.updateModalObject(content);
        }
        successModal(); 
    }
    const handleChange = (field, value) => {
        updateFormData({ ...user, [field]: value });
    }
    const passwordsMatch = (newPassword.password === newPassword.confirmPassword) && (newPassword.password !== null);
    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        if (!passwordsMatch) return;
        const response = await fetch('/edit/password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                _id: user._id,
                password: newPassword.password
            })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success: true response from server');
        const successModal = () => {
            const content = (
                <div className="modalContent" ref={modalContent}>
                    <h2>Success!</h2>
                    <p>Your password has been changed.</p>
                    <div className="buttons">
                        <button onClick={() => props.gracefullyCloseModal(modalContent.current)}>Continue</button>
                    </div>
                </div>
            )
            changePasswordForm.current.reset();
            props.updateModalObject(content);
        }
        successModal(); 
    }
    const handleChangePassword = async (field, value) => {
        updateNewPassword({ ...newPassword, [field]: value });
    }
    const confirmDeleteAccount = () => {
        const deleteAccount = async (e) => {
            e.preventDefault();
            props.updateModalObject(content({ loadingIcon: true }));
            const response = await ('/delete/account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ _id: user._id })
            });
            const body = await response.json();
            if (!body) return console.log('no response from server');
            if (!body.success) return console.log('no success: true response from server');
            window.location.href = '/';
        }
        const content = (options = {
            loadingIcon: false
        }) => (
            <div className="modalContent" ref={modalContent}>
                <h2>Are you sure?</h2>
                If you continue, your data will be lost forever!
                {options.loadingIcon
                    ?   <Loading />
                    :   <form onSubmit={deleteAccount} className="buttons">
                            <button type="submit">Yes, I'm sure</button>
                            <button type="button" className="greyed" onClick={() => props.gracefullyCloseModal(modalContent.current)}>Cancel</button>
                        </form>
                    }
            </div>
        );
        props.updateModalObject(content());
    }
    return (
        <div>
            <h1>My Account</h1>
            <form onSubmit={handleSubmit} autoComplete="off">
                <div className="Account">
                    <div className="half">
                        <label htmlFor="firstName">First name:</label>
                        <input type="text" defaultValue={user.firstName} name="firstName" onInput={(e) => handleChange('firstName', e.target.value)} />
                    </div>
                    <div className="half">
                        <label htmlFor="lastName">Last name:</label>
                        <input type="text" defaultValue={user.lastName} name="lastName" onInput={(e) => handleChange('lastName', e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="email">Email address:</label>
                        <input type="text" defaultValue={user.email} name="email" onInput={(e) => handleChange('email', e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="username">Username:</label>
                        <input type="text" defaultValue={user.username} name="username" onInput={(e) => handleChange('username', e.target.value)} />
                    </div>
                    <input type="submit" value="Save changes" />
                </div>
            </form>
            <div className="formSection">
                <div className="text">
                    <strong>Change password</strong>
                    <form className="changePassword" ref={changePasswordForm} onSubmit={handleSubmitPassword} autoComplete="off">
                        <div>
                            <label htmlFor="newPassword">Enter new password:</label>
                            <input type="password" name="newPassword" onInput={(e) => handleChangePassword('password', e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword">Confirm new password:</label>
                            <input type="password" name="confirmPassword" onInput={(e) => handleChangePassword('confirmPassword', e.target.value)} />
                        </div>
                        <div className="buttonDiv">
                            <button disabled={!passwordsMatch} onClick={handleSubmitPassword}>Change password</button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="formSection formGrid">
                <div className="text">
                    <strong>Delete my account</strong>
                    Deleting your account will permanently delete all notes, settings, and other data associated with this account. This cannot be undone.
                </div>
                <button className="caution" onClick={confirmDeleteAccount}>Delete my account</button>
            </div>
        </div>
    );
}

function CreateAccount(props) {
    const [formData, updateFormData] = useState({ _id: props.user._id });
    const modalContent = useRef(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('/create/account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) {
            console.log('no success: true response from server');
            console.dir(body.errorReport);
            return;
        }
        const successModal = () => {
            const buttonContinue = () => {
                props.updateIsLoaded(false);
                props.gracefullyCloseModal(modalContent.current);
                props.refreshData();
                window.history.pushState('', '', `/d/${formData.username}`);
            }
            const content = (
                <div className="modalContent" ref={modalContent}>
                    <h2>Success!</h2>
                    <p>Your account has been created.</p>
                    <div className="buttons">
                        <button onClick={buttonContinue}>Continue</button>
                    </div>
                </div>
            )
            props.updateModalObject(content);
        }
        successModal(); 
    }
    const handleChange = (field, value) => {
        updateFormData({ ...formData, [field]: value });
    }
    return (
        <div>
            <h1>Create an Account</h1>
            <p>It looks like you haven't registered an account yet. To customize your Dragonfly dashboard URL, password-protect your notes, and personalize your dashboard, create a free account below. Click <a href="/">here</a> to learn more.</p>
            <form onSubmit={handleSubmit} autoComplete="off">
                <div className="Account">
                    <div className="half">
                        <label htmlFor="firstName">First name:</label>
                        <input type="text" name="firstName" onInput={(e) => handleChange('firstName', e.target.value)} />
                    </div>
                    <div className="half">
                        <label htmlFor="lastName">Last name:</label>
                        <input type="text" name="lastName" onInput={(e) => handleChange('lastName', e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="email">Email address:</label>
                        <input type="text" name="email" onInput={(e) => handleChange('email', e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="username">Username:</label>
                        <input type="text" name="username" onInput={(e) => handleChange('username', e.target.value)} />
                        {formData.username || (formData.username && formData.username !== '')
                            ? <span className="urlpreview">Your Dragonfly dashboard URL will be <b>http://localhost:3000/d/{formData.username}.</b></span>
                            : ''
                        }
                    </div>
                    <div>
                        <label htmlFor="password">Password:</label>
                        <input type="password" name="password" onInput={(e) => handleChange('password', e.target.value)} />
                    </div>
                    <div className="toc">
                        <input type="checkbox" /> I have read and agree to the <a href="/">Terms & Conditions</a>.
                    </div>
                </div>
                <input type="submit" />
            </form>
        </div>
    );
}