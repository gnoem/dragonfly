import { useState, useEffect } from 'react';
import Loading from './Loading';

export default function Button(props) {
    const { className, onClick: functionToCall, loadingIconSize, isClicked, children } = props;
    const [loadingIcon, setLoadingIcon] = useState(false);
    useEffect(() => {
        if (isClicked) handleClick();
    }, [isClicked]);
    if (loadingIcon) return <Loading mini={true} size={loadingIconSize} />;
    const handleClick = () => {
        setLoadingIcon(true);
        setTimeout(functionToCall, 1000);
    }
    return (
        <button className={className} onClick={handleClick}>
            {children}
        </button>
    )
}