import React, { useState, useEffect, useRef, useContext } from "react";
import { ModalContext } from "../../contexts";
import { handleError } from "../../services";
import { Button } from "./Button";
import { Input } from "./Input";

export const Form = ({ modal, title, children, noLoad, loadingOnly, className, submit, onSubmit, onSuccess, handleFormError, reset }) => {
    const [success, setSuccess] = useState(null);
    const [successPending, setSuccessPending] = useState(false);
    const { createModal } = useContext(ModalContext);
    const formRef = useRef(null);
    useEffect(() => {
        if (reset && formRef) formRef.current.reset();
    }, [reset, formRef]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const initialDelay = noLoad ? 0 : 300;
        setTimeout(() => {
            if (!noLoad) setSuccessPending(true);
            onSubmit()
                .then(result => {
                    if (!noLoad && !loadingOnly) {
                        setSuccess(true)
                        setSuccess(false);
                    }
                    const successDelay = noLoad ? 0 : 1200;
                    setTimeout(() => {
                        onSuccess?.(result);
                    }, successDelay);
                })
                .catch(err => {
                    setSuccessPending(false);
                    handleError(err, { handleFormError, createModal });
                });
        }, initialDelay);
    }
    const submitShouldInherit = { modal, success, onSuccess, successPending };
    const customSubmit = submit ? React.cloneElement(submit, submitShouldInherit) : null;
    return (
        <form onSubmit={handleSubmit} className={className} autoComplete="off" ref={formRef}>
            <h2>{title}</h2>
            {children}
            {(submit === false) || (customSubmit ?? <Submit {...submitShouldInherit} />)}
        </form>
    );
}

export const Submit = ({ modal, value, buttonClass, nvm, cancel, success, successPending, disabled }) => {
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
                    successPending={successPending}
                    disabled={disabled}>
                {value || 'Submit'}
            </Button>
            {(cancel !== false) && <button type="button" className="greyed" onClick={handleCancel}>{nvm || 'Cancel'}</button>}
        </div>
    );
}

export { Button, Input }