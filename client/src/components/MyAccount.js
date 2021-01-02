import { useState, useRef } from 'react';
import Modal from './Modal';

export default function MyAccount(props) {
    return (
        <div className="Panel">
            {props.user.username
                ? <Account user={props.user} refreshData={props.refreshData} updateIsLoaded={props.updateIsLoaded} />
                : <CreateAccount user={props.user} refreshData={props.refreshData} updateIsLoaded={props.updateIsLoaded} />
            }
        </div>
    )
}

function Account(props) {
    const { user } = props;
    const [formData, updateFormData] = useState({ user });
    const [showingModal, updateShowingModal] = useState(false);
    const modalContent = useRef(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
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
                    gracefullyCloseModal(modalContent.current);
                    props.refreshData();
                    return;
                }
                props.updateIsLoaded(false);
                gracefullyCloseModal(modalContent.current);
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
            updateShowingModal(content);
        }
        successModal(); 
    }
    const handleChange = (field, value) => {
        updateFormData({ ...user, [field]: value });
    }
    const confirmDeleteAccount = () => {
        const content = (
            <div className="modalContent" ref={modalContent}>
                <h2>Are you absolutely sure?</h2>
                If you continue, your data will be lost forever!
                <div className="buttons">
                    <button onClick={deleteAccount}>Yes, I'm sure</button>
                    <button className="greyed" onClick={() => gracefullyCloseModal(modalContent.current)}>Take me back</button>
                </div>
            </div>
        );
        updateShowingModal(content);
    }
    const deleteAccount = () => {
        console.log('deleting account');
    }
    const gracefullyCloseModal = (modal) => {
        let container = modal.classList.contains('Modal')
            ? modal
            : modal.closest('.Modal');
        container.classList.add('goodbye');
        setTimeout(() => updateShowingModal(false), 200);
    }
    const showModal = (content) => {
        if (!content) return;
        return (
            <Modal exitModal={gracefullyCloseModal}>
                {content}
            </Modal>
        )
    }
    return (
        <div>
            {showModal(showingModal)}
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
                    <input type="submit" value="Save Changes" />
                </div>
            </form>
            <div className="deleteAccount">
                <div className="text">
                    <strong>Delete my account</strong>
                    Deleting your account will permanently delete all notes, settings, and other data associated with this account. This cannot be undone.
                </div>
                <button className="caution" onClick={confirmDeleteAccount}>Delete my account</button>
            </div>
        </div>
    )
}

function CreateAccount(props) {
    const [formData, updateFormData] = useState({ _id: props.user._id });
    const [showingModal, updateShowingModal] = useState(false);
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
                gracefullyCloseModal(modalContent.current);
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
            updateShowingModal(content);
        }
        successModal(); 
    }
    const handleChange = (field, value) => {
        updateFormData({ ...formData, [field]: value });
    }
    const gracefullyCloseModal = (modal) => {
        let container = modal.classList.contains('Modal')
            ? modal
            : modal.closest('.Modal');
        container.classList.add('goodbye');
        setTimeout(() => updateShowingModal(false), 200);
    }
    const showModal = (content) => {
        if (!content) return;
        return (
            <Modal exitModal={gracefullyCloseModal}>
                {content}
            </Modal>
        )
    }
    return (
        <div>
            <div id="demo" onClick={() => console.log(formData)}></div>
            {showModal(showingModal)}
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
    )
}