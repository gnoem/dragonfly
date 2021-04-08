import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { User } from "api";
import { handleError } from "services";
import { Dashboard } from "../Dashboard";
import { Login } from "../Login";

export const Gateway = ({ createModal }) => {
    const { identifier } = useParams();
    const [accessToken, setAccessToken] = useState(null);
    const [loginWarning, setLoginWarning] = useState(null);
    const userId = useRef(null);
    useEffect(() => {
        const handleAuthError = (err) => {
            setAccessToken(false);
            if (err.status === 404) {
                setLoginWarning('User not found');
                return;
            }
            handleError(err, { createModal });
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
    if (accessToken === false) return (
        <Login
            username={identifier}
            loginWarning={loginWarning}
            updateAccessToken={setAccessToken}
            createModal={createModal}
        />
    );
    return <Dashboard {...{ userId, accessToken }} />;
}