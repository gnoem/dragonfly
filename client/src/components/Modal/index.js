import { useEffect, useRef } from 'react';
import { elementHasParent } from '../../utils';
import { formStore } from '../Form';

// custom modals located in: NoteList

export const Modal = (props) => {
    const { children, content, type } = props;
    const formContent = () => {
        switch (type) {
            case 'form': return formStore[content](props);
            case 'custom': return content;
            default: return content;
        }
    }
    return (
        <ModalWrapper {...props}>
            {children ?? formContent()}
        </ModalWrapper>
    );
}

const ModalWrapper = (props) => {
    const { children, exit, selfDestruct, setModal, ignoreClick } = props;
    const modalContainer = useRef(null);
    const modalContent = useRef(null);
    useEffect(() => {
        if (!selfDestruct) return;
        if (modalContainer) modalContainer.current.classList.remove('active');
        setTimeout(() => setModal(null), 200);
    }, [selfDestruct]);
    useEffect(() => {
        if (modalContainer) modalContainer.current.classList.add('active');
        const closeModal = (e) => {
            if (ignoreClick) { // will be an array of selectors like ['button', '#menu li']
                for (let selector of ignoreClick) {
                    if (elementHasParent(e.target, selector)) return;
                }
            }
            if (!modalContent.current) return () => window.removeEventListener('click', closeModal);
            if (!modalContent.current.contains(e.target)) exit();
        }
        window.addEventListener('click', closeModal);
        return () => window.removeEventListener('click', closeModal);
    }, []);
    return (
        <div className="Modal" ref={modalContainer}>
            <div className="modalContainer">
                <div className="modalContent" ref={modalContent}>
                    <button className="stealth exit" onClick={exit}><i className="fas fa-times"></i></button>
                    {children}
                </div>
            </div>
        </div>
    )
}