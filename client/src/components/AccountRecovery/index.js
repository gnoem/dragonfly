import "./AccountRecovery.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { User } from "../../api";
import { handleError } from "../../services";
import { Loading } from "../Loading";
import { Guest } from "../Guest";
import { EditPassword } from "../MyAccount";

export const AccountRecovery = ({ createModal }) => {
    const { token } = useParams();
    const [userId, setUserId] = useState(null);
    const [tokenIsValid, setTokenIsValid] = useState(null);
    useEffect(() => {
        if (!token) return setTokenIsValid(false);
        User.validateToken(token).then(({ isValid, userId }) => {
            setUserId(userId)
            setTokenIsValid(isValid)
        }).catch(err => {
            setTokenIsValid(false);
            handleError(err, { createModal });
        });
    }, [token]);
    if (tokenIsValid == null) return <Loading />;
    return (
        <Guest className="AccountRecovery">
            {tokenIsValid
                ? <ValidToken {...{ userId, createModal }} />
                : <InvalidToken {...{ createModal }} />}
        </Guest>
    );
}

const InvalidToken = ({ createModal }) => {
    const handleClick = () => createModal('resetPassword', 'form');
    return (
        <>
            <h2>Reset password</h2>
            Sorry, this link is invalid or expired. If you are trying to reset your password, click <button className="stealth link" onClick={handleClick}>here</button> to generate a new password recovery link.
        </>
    );
}

const ValidToken = ({ userId }) => {
    const user = { _id: userId };
    const [success, setSuccess] = useState(false);
    const resetSuccess = () => setSuccess(true);
    const handleContinue = () => window.location.assign(`/d/${userId}`);
    if (success) return (
        <div>
            <h2>Success!</h2>
            <p>Your password has been reset.</p>
            <div className="buttons">
                <button type="button" onClick={handleContinue}>Continue</button>
            </div>
        </div>
    );
    return (
        <div>
            <h2>Reset password</h2>
            <p>Your new password must be at least 6 characters in length.</p>
            <EditPassword {...{ resetMode: true, resetSuccess, user }} />
        </div>
    );
}