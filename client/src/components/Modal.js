import { useEffect, useRef } from 'react';

export default function Modal(props) {
    const { exitModal } = props;
    const dim = useRef(null);
    const modalContainer = useRef(null);
    useEffect(() => {
        const closeModal = (e) => {
            if (!modalContainer.current) return () => {
                window.removeEventListener('click', closeModal);
            }
            if (!modalContainer.current.contains(e.target)) exitModal(dim.current);
        }
        window.addEventListener('click', closeModal);
        return () => {
            window.removeEventListener('click', closeModal);
        }
    }, [exitModal]);
    return (
        <div className="Modal" ref={dim}>
            <div className="modalSpacer">
                <div className="modalContainer" ref={modalContainer}>
                    <button className="stealth exit" onClick={() => exitModal(dim.current)}><i className="fas fa-times"></i></button>
                    {props.children}
                </div>
            </div>
        </div>
    )
}