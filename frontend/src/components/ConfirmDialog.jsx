export default function ConfirmDialog({ message, onConfirm, onCancel }) {
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-dialog">
                    <h2>Confirm Action</h2>
                    <p>{message}</p>
                    <div className="confirm-actions">
                        <button className="btn btn-danger" onClick={onConfirm}>
                            Delete
                        </button>
                        <button className="btn btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
