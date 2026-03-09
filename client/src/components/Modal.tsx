import type { ReactNode } from "react"
import { X } from "lucide-react"
import "./Modal.css"

interface ModalProps {
    open: boolean
    onClose: () => void
    title: string
    children: ReactNode
    actions?: ReactNode
}

export default function Modal({ open, onClose, title, children, actions }: ModalProps) {
    if (!open) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                {actions && <div className="modal-actions">{actions}</div>}
            </div>
        </div>
    )
}
