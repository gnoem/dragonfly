import React, { useState, useEffect, useContext, useRef } from "react";
import { User } from "api";
import { ModalContext } from "../../contexts";
import { handleError } from "services";
import { Modal } from "../Modal";
import { Dashboard } from "../Dashboard";
import { Login } from "../Login";

export const Gateway = ({ match }) => {
    const { id: identifier } = match.params;
    const [accessToken, setAccessToken] = useState(null);
    const [loginWarning, setLoginWarning] = useState(null);
    const { modal, setModal, closeModal } = useContext(ModalContext);
    const userId = useRef(null);
    useEffect(() => {
        const handleAuthError = (err) => {
            setAccessToken(false);
            if (err.status === 404) {
                setLoginWarning('User not found');
                return;
            }
            handleError(err, { updateModal: setModal });
        }
        const auth = (customId) => User.auth(customId ?? identifier).then(({ _id, token, username }) => {
            if (username) {
                window.history.pushState('', '', `/d/${username}`);
                auth(username);
                return;
            }
            setAccessToken(token);
            userId.current = _id;
        }).catch(handleAuthError);
        auth();
    }, []);
    return (
        <>
            {modal && <Modal {...modal} />}
            {(accessToken === false)
                ? <Login
                    username={identifier}
                    loginWarning={loginWarning}
                    updateAccessToken={setAccessToken} />
                : <Dashboard {...{ userId, accessToken }} />}
        </>
    );
}