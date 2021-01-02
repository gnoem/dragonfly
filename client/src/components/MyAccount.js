import { useState, useRef } from 'react';
import Modal from './Modal';

export default function MyAccount(props) {
    return (
        <div className="Panel">
            {props.user.username
                ? <Account user={props.user} refreshData={props.refreshData} />
                : <CreateAccount user={props.user} refreshData={props.refreshData} updateIsLoaded={props.updateIsLoaded} />
            }
        </div>
    )
}

function Account(props) {
    const logout = async () => {
        const response = await fetch('/logout/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success: true response from server');
        window.location.href = `/d/${props.user.username}`;
    }
    return (
        <div>
            <h1>My Account</h1>
            <button onClick={logout}>Log out</button>
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
                window.location.href = `/d/${formData.username}`;
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
                <div className="Signup">
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