import React, { useState, useEffect, useRef, useContext } from "react";
import { ModalContext } from "../../contexts";
import { handleError } from "../../services";
import { Button } from "./Button";
import { Input } from "./Input";

export const Form = ({ title, children, formClass, submit, onSubmit, onSuccess, handleFormError, reset }) => {
    const [success, setSuccess] = useState(null);
    const [successPending, setSuccessPending] = useState(false);
    const { modal, createModal } = useContext(ModalContext);
    const formRef = useRef(null);
    useEffect(() => {
        if (reset && formRef) formRef.current.reset();
    }, [reset, formRef]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setTimeout(() => {
            setSuccessPending(true);
            onSubmit()
                .then(() => setSuccess(true))
                .then(() => setSuccess(false))
                .catch(err => {
                    setSuccessPending(false);
                    handleError(err, { handleFormError, createModal });
                });
        }, 300);
    }
    const submitShouldInherit = { modal, success, onSuccess, successPending };
    const customSubmit = submit ? React.cloneElement(submit, submitShouldInherit) : null;
    return (
        <form onSubmit={handleSubmit} className={formClass} autoComplete="off" ref={formRef}>
            <h2>{title}</h2>
            {children}
            {customSubmit ?? <Submit {...submitShouldInherit} />}
        </form>
    );
}

export const Submit = ({ modal, value, buttonClass, nvm, cancel, success, onSuccess, successPending, disabled }) => {
    const { closeModal } = useContext(ModalContext);
    const handleCancel = () => {
        if (cancel) cancel();
        if (modal) closeModal();
    }
    return (
        <div className="buttons">
            <Button type="submit"
                    className={buttonClass}
                    showLoadingIcon={true}
                    success={success}
                    reportSuccess={onSuccess}
                    successPending={successPending}
                    disabled={disabled}>
                {value || 'Submit'}
            </Button>
            {(cancel !== false) && <button type="button" className="greyed" onClick={handleCancel}>{nvm || 'Cancel'}</button>}
        </div>
    );
}

export { Button, Input }