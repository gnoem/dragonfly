import { useState, useEffect } from 'react';
import Loading from '../Loading';

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
            setTimeout(() => {
                if (reportSuccess) return reportSuccess();
                if (unmountButton) setPoof(true);
                else setSuccessAnimation(false);
            }, 500);
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

const SuccessAnimation = () => {
    return (
        <div className="SuccessAnimation">
            <svg viewBox="0 0 10 10">
                <path d="M5 10 L10 10 L10 0" />
            </svg>
        </div>
    );
}