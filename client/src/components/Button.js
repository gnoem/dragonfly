import { useState } from 'react';
import Loading from './Loading';

export default function Button({ className, onClick: functionToCall, loadingIconSize, children }) {
    const [loadingIcon, setLoadingIcon] = useState(false);
    if (loadingIcon) return <Loading mini={true} size={loadingIconSize} />;
    const handleClick = () => {
        setLoadingIcon(true);
        functionToCall();
    }
    return (
        <button className={className} onClick={handleClick}>
            {children}
        </button>
    )
}