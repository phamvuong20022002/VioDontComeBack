import React from 'react'
import './style2.css'
import { ROOMOPTIONS } from '../../Status'

const Modal = ({ onOptionClick, onClose }) => {
  return (
    <div className="modal-container" id="modal-opened">
        <div className="modal">

            <div className="modal__details">
            <h1 className="modal__title">Select Your Language</h1>
            <p className="modal__description">
            "Choose a beautiful coffin, climb in and code until you die"
            </p>
            </div>
            <span className="modal__groupname">TEMPLATES</span>
            <div className="modal__content">
                <div className="card" onClick={() => onOptionClick(ROOMOPTIONS.JAVASCRIPT)}>
                    <div className="card__image">
                        <img src="/icons8-javascript-480.png" alt="JS Icon"/>
                    </div>
                    <div className="card__title">
                        <p>Javascript</p>
                    </div>
                </div>

                <div className="card" onClick={() => onOptionClick(ROOMOPTIONS.REACT)}>
                    <div className="card__image">
                        <img src="/icons8-react-js-480.png" alt="React Icon"/>
                    </div>
                    <div className="card__title">
                        <p>React</p>
                    </div>
                </div>
            </div>

            <div href="#modal-closed" className="link-2" onClick={() => onClose(true)}></div>

        </div>
    </div>
  )
}
export default Modal