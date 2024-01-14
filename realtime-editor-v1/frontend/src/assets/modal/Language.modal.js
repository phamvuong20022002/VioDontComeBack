// Modal component
const Modal = ({ onOptionClick, onClose }) => {
    return (
        <div className="modal">
            <h2>Select an option:</h2>
            <button className="btn" onClick={() => onOptionClick('HTML')}>
                HTML
            </button>
            <button className="btn" onClick={() => onOptionClick('REACT')}>
                REACT
            </button>
        </div>
    );
};

export default Modal