import React, { useState, useEffect, useRef } from 'react';
import Loading from '../Loading';

export const Form = (props) => {
    const { title, children, formClass, submit, formData, onSubmit, onSuccess, reset } = props;
    const [success, setSuccess] = useState(null);
    const formRef = useRef(null);
    useEffect(() => {
        if (reset && formRef) formRef.current.reset();
    }, [reset, formRef]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setTimeout(() => {
            onSubmit(formData).then(() => setSuccess(true)).then(() => setSuccess(false));
        }, 300);
    }
    const customSubmit = submit ? React.cloneElement(submit, { ...props, success, onSuccess }) : null;
    return (
        <form onSubmit={handleSubmit} className={formClass} autoComplete="off" ref={formRef}>
            <h2>{title}</h2>
            {children}
            {customSubmit ?? <Submit {...props} success={success} onSuccess={onSuccess} />}
        </form>
    );
}

export const Submit = (props) => {
    const { modal, value, buttonClass, nvm, cancel, success, onSuccess, disabled } = props;
    const handleCancel = () => {
        if (cancel) cancel();
        if (modal) props.gracefullyCloseModal();
    }
    return (
        <div className="buttons">
            <Button type="submit"
                    className={buttonClass}
                    showLoadingIcon={true}
                    success={success}
                    reportSuccess={onSuccess}
                    disabled={disabled}>
                {value || 'Submit'}
            </Button>
            {(cancel !== false) && <button type="button" className="greyed" onClick={handleCancel}>{nvm || 'Cancel'}</button>}
        </div>
    );
}

export const Button = ({ type, onClick, isClicked, className, disabled, showLoadingIcon, success, reportSuccess, unmountButton, children }) => {
    const [poof, setPoof] = useState(false);
    const [loadingIcon, setLoadingIcon] = useState(false);
    const [successAnimation, setSuccessAnimation] = useState(false);
    useEffect(() => {
        if (isClicked) handleClick();
    }, [isClicked]);
    useEffect(() => {
        if (poof) setTimeout(unmountButton, 500);
    }, [poof]);
    useEffect(() => {
        if (success) {
            setLoadingIcon(false);
            setSuccessAnimation(true);
            if (reportSuccess) setTimeout(reportSuccess, 500);
            if (unmountButton) setTimeout(() => setPoof(true), 500);
            else setTimeout(() => setSuccessAnimation(false), 1500);
        }
    }, [success]);
    const handleClick = () => {
        if (loadingIcon || successAnimation) return;
        if (showLoadingIcon) setLoadingIcon(true);
        setTimeout(onClick, 700);
    }
    const statusIcon = (() => {
        if (loadingIcon) return <Loading />;
        if (successAnimation) return <SuccessAnimation />;
        return null;
    })();
    const buttonClassName = (() => {
        const isPoofing = `${poof ? ' poof' : ''}`;
        if (!className) return isPoofing;
        else return className + isPoofing;
    })();
    return (
        <button type={type ?? 'button'} onClick={handleClick}
                className={buttonClassName}
                disabled={disabled}>
            {statusIcon}
            <span data-ghost={!!statusIcon}>{children}</span>
        </button>
    );
}

export const Input = ({ type, name, label, className, defaultValue, onChange, onInput, disabled }) => {
    return (
        <div className="Input">
            <label htmlFor={name}>{label}</label>
            <input
                type={type}
                name={name}
                className={className}
                defaultValue={defaultValue}
                onChange={onChange}
                onInput={onInput}
                disabled={disabled} />
        </div>
    );
}

const SuccessAnimation = () => {
    return (
        <div className="SuccessAnimation">
            <svg viewBox="0 0 10 10">
                <path d="M5 10 L10 10 L10 0" />
            </svg>
        </div>
    );
}