import { useEffect, useRef } from 'react';
import { elementHasParent } from '../utils';

export default function Modal({ exitModal, content }) {
    const dim = useRef(null);
    const modalContainer = useRef(null);
    useEffect(() => {
        if (!content) return;
        const closeModal = (e) => {
            if (!modalContainer.current) return () => {
                window.removeEventListener('click', closeModal);
            }
            if (elementHasParent(e.target, '#demo')) return;
            if (modalContainer.current.contains(e.target)) return;
            exitModal(dim.current);
        }
        window.addEventListener('click', closeModal);
        // todo add escape keydown event listener
        return () => {
            window.removeEventListener('click', closeModal);
        }
    }, [exitModal]); // should be content prop instead? for when content switches between false and jsx object
    if (!content) return null;
    return (
        <div className="Modal" ref={dim}>
            <div className="modalSpacer">
                <div className="modalContainer" ref={modalContainer}>
                    <button className="stealth exit" onClick={() => exitModal(dim.current)}><i className="fas fa-times"></i></button>
                    {content}
                </div>
            </div>
        </div>
    )
}