import { useState } from 'react';
import Loading from './Loading';

const refreshPage = () => {
    window.location.reload();
    return false;
}

export function ServerError() {
    const [loadingIcon, setLoadingIcon] = useState(false);
    const handleClick = () => {
        setLoadingIcon(true);
        refreshPage();
    }
    return (
        <div className="modalContent">
            <h2>Server error</h2>
            Check your Internet connection and try again. If the problem persists, that means there's something wrong on our end. Sorry about that!
            {loadingIcon
                ?   <Loading />
                :   <div className="buttons">
                        <button onClick={handleClick}>Close and refresh</button>
                    </div>
                }
        </div>
    );
}

export function SomethingWentWrong() {
    const [loadingIcon, setLoadingIcon] = useState(false);
    const handleClick = () => {
        setLoadingIcon(true);
        refreshPage();
    }
    return (
        <div className="modalContent">
            <h2>Something went wrong</h2>
            We weren't able to complete your request. So sorry! If the problem persists, please submit an error report. {/* todo */}
            {loadingIcon
                ?   <Loading />
                :   <div className="buttons">
                        <button onClick={handleClick}>Close and refresh</button>
                    </div>
                }
        </div>
    );
}