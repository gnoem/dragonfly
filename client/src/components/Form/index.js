import React, { useState, useEffect, useRef } from "react";
import { handleError } from "../../services";
import { Button } from "./Button";
import { Input } from "./Input";

export const Form = (props) => {
    const { title, children, formClass, submit, formData, onSubmit, onSuccess, handleFormError, reset, updateModal } = props;
    const [success, setSuccess] = useState(null);
    const [successPending, setSuccessPending] = useState(false);
    const formRef = useRef(null);
    useEffect(() => {
        if (reset && formRef) formRef.current.reset();
    }, [reset, formRef]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setTimeout(() => {
            setSuccessPending(true);
            onSubmit(formData) // does formData even need to be here? should already be in the declaration for onSubmit
            // maybe as a fallback
                .then(() => setSuccess(true))
                .then(() => setSuccess(false))
                .catch(err => {
                    setSuccessPending(false);
                    handleError(err, { handleFormError, updateModal });
                });
        }, 300);
    }
    const customSubmit = submit ? React.cloneElement(submit, { ...props, success, onSuccess, successPending }) : null;
    return (
        <form onSubmit={handleSubmit} className={formClass} autoComplete="off" ref={formRef}>
            <h2>{title}</h2>
            {children}
            {customSubmit ?? <Submit {...props} success={success} onSuccess={onSuccess} successPending={successPending} />}
        </form>
    );
}

export const Submit = ({ modal, value, buttonClass, nvm, cancel, success, onSuccess, successPending, disabled, gracefullyCloseModal }) => {
    const handleCancel = () => {
        if (cancel) cancel();
        if (modal) gracefullyCloseModal();
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