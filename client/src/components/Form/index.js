import React, { useState, useEffect, useRef } from 'react';
import Loading from '../Loading';
import './Input.css';

export const Form = (props) => {
    const { title, children, formClass, submit, formData, onSubmit, onSuccess, handleError, reset } = props;
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
            onSubmit(formData)
                .then(() => setSuccess(true))
                .then(() => setSuccess(false))
                .catch(err => {
                    console.dir(err);
                    setSuccessPending(false);
                    handleError?.(err);
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

export const Button = ({ type, onClick, isClicked, className, disabled, showLoadingIcon, success, reportSuccess, successPending, unmountButton, children }) => {
    const [poof, setPoof] = useState(false);
    const [loadingIcon, setLoadingIcon] = useState(false);
    const [successAnimation, setSuccessAnimation] = useState(false);
    const buttonRef = useRef(null);
    useEffect(() => {
        if (successPending === false) setLoadingIcon(false);
    }, [successPending])
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
            buttonResolve();
        }
    }, [success, buttonRef?.current]);
    const buttonResolve = () => {
        if (unmountButton) setTimeout(() => {
            if (buttonRef.current) setPoof(true);
        }, 500);
        else setTimeout(() => {
            if (buttonRef.current) setSuccessAnimation(false);
        }, 1500);
    }
    const handleClick = () => {
        if (loadingIcon || successAnimation) return;
        if (showLoadingIcon) {
            setLoadingIcon(true);
            setTimeout(onClick, 700);
        }
        else onClick();
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
                disabled={disabled}
                ref={buttonRef}>
            {statusIcon}
            <span data-ghost={!!statusIcon}>{children}</span>
        </button>
    );
}

export const Input = ({ type, name, label, className, defaultValue, onChange, onInput, note, hint, disabled }) => {
    const inputRef = useRef(null);
    return (
        <div className="Input">
            <label htmlFor={name}>{label}</label>
            <div>
                <input
                    type={type}
                    name={name}
                    className={className}
                    defaultValue={defaultValue}
                    onChange={onChange}
                    onInput={onInput}
                    disabled={disabled}
                    ref={inputRef} />
                {hint && <InputHint {...hint} inputRef={inputRef} />}
            </div>
            <InputNote>{note}</InputNote>
        </div>
    );
}

const InputNote = ({ children }) => {
    return <div className="InputNote">{children}</div>
}

const InputHint = ({ type, message, inputRef }) => {
    const [show, setShow] = useState(false);
    const messageRef = useRef(null);
    useEffect(() => {
        if (!messageRef.current) return;
        const inputWidth = inputRef?.current?.scrollWidth;
        const messageWidth = messageRef?.current?.scrollWidth;
        if (messageWidth > inputWidth) {
            messageRef.current.style.width = (inputWidth - 22) + 'px';
            messageRef.current.style.whiteSpace = 'normal';
        }
        messageRef.current.style.opacity = '1';
    }, [messageRef, inputRef, show]);
    const className = (() => {
        let className = 'InputHint';
        if (type === 'success') className += ' success'; else className += ' error';
        if (show) className += ' show';
        return className;
    })();
    return (
        <div className={className}>
            <InputHintIcon type={type} updateShow={setShow} />
            {show && <span className="inputHintMessage" ref={messageRef}>{message}</span>}
        </div>
    );
}

const InputHintIcon = ({ type, updateShow }) => {
    return (
        <span className="inputHintIcon" onMouseEnter={() => updateShow(true)} onMouseLeave={() => updateShow(false)}>
            {(type === 'success') ? <i className="fas fa-check"></i> : <i className="fas fa-exclamation"></i>}
        </span>
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