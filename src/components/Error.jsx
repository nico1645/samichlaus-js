import { useEffect, useRef } from "react";
import useTour from "../provider/Tour";
import PropTypes from 'prop-types';

export default function Error({ isOpen, onClose }) {
  const modal = useRef(null);
  const { error } = useTour();
  useEffect(() => {
    if (modal.current) {
      if (isOpen) {
        modal.current.showModal();
      } else {
        modal.current.close();
      }
    }
  }, [isOpen]);

  return (
    <dialog
      ref={modal}
      id="openModal"
      className="modal focus:outline-none bg-gray-50 border rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700 p-4 "
    >
      <div className="flex mb-2 modal-header dark:text-white justify-between flex-row items-center">
        <div className=" text-xl px-4 font-bold">Unexpected Error Occurred</div>
        <span
          onClick={onClose}
          className="p-2 px-4 align-bottob-2 border-2 dark:border-white border-black hover:cursor-pointer rounded-full"
        >
          X
        </span>
      </div>
      <div className="modal-body">
        <div className="w-full rounded-lg p-2 text-white bg-red-500 border-red-600 border-2">
          {error}
        </div>
      </div>
    </dialog>
  );
}

Error.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
