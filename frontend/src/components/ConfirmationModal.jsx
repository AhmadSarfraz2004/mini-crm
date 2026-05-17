import { useEffect, useRef } from "react";

export default function ConfirmationModal({
    open,
    title = "Confirm",
    message = "Are you sure?",
    confirmLabel = "Delete",
    onConfirm,
    onCancel,
}) {
    const modalRef = useRef(null);
    const openRef = useRef(open);
    const onCancelRef = useRef(onCancel);

    useEffect(() => {
        openRef.current = open;
    }, [open]);

    useEffect(() => {
        onCancelRef.current = onCancel;
    }, [onCancel]);

    useEffect(() => {
        const modalElement = modalRef.current;
        const Modal = window.bootstrap?.Modal;

        if (!modalElement || !Modal) return;

        const modal = Modal.getOrCreateInstance(modalElement);

        if (open) {
            modal.show();
        } else {
            modal.hide();
        }
    }, [open]);

    useEffect(() => {
        const modalElement = modalRef.current;

        if (!modalElement) return undefined;

        const handleHidden = () => {
            if (openRef.current) {
                onCancelRef.current?.();
            }
        };

        modalElement.addEventListener("hidden.bs.modal", handleHidden);

        return () => {
            modalElement.removeEventListener("hidden.bs.modal", handleHidden);
            window.bootstrap?.Modal.getInstance(modalElement)?.dispose();
        };
    }, []);

    return (
        <div
            className="modal fade dashboard-bootstrap-modal"
            tabIndex="-1"
            aria-labelledby="confirmation-modal-title"
            aria-hidden={!open}
            ref={modalRef}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content dashboard-modal-content">
                    <div className="modal-body dashboard-confirmation-body">
                        <div className="dashboard-confirmation-title-row">
                            <h2 className="modal-title" id="confirmation-modal-title">
                                {title}
                            </h2>

                            <button
                                type="button"
                                className="btn-close dashboard-confirmation-close"
                                aria-label="Close"
                                onClick={onCancel}
                            ></button>
                        </div>

                        <div className="dashboard-confirmation-message-block">
                            <i
                                className="bi bi-exclamation-triangle-fill dashboard-confirmation-warning"
                                aria-hidden="true"
                            ></i>
                            <p className="dashboard-confirmation-message">{message}</p>
                        </div>

                        <div className="dashboard-confirmation-actions">
                            <button type="button" className="btn btn-danger" onClick={onConfirm}>
                                {confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
