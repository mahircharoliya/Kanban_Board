// Card.jsx
import React, { memo, useState } from "react";
import { COLUMNS, COLUMN_LABELS } from "../boardReducer";

function CardBase({ card, onMove, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(card.title);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const columnIndex = COLUMNS.indexOf(card.column);
  const canMoveLeft = columnIndex > 0;
  const canMoveRight = columnIndex < COLUMNS.length - 1;

  function commitEdit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== card.title) onEdit(card.id, trimmed);
    setIsEditing(false);
  }

  function handleDragStart(e) {
    e.dataTransfer.setData("text/card-id", card.id);
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <div className="kb-card" draggable={!isEditing} onDragStart={handleDragStart}>
      {isEditing ? (
        <input
          className="kb-card-input"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") {
              setDraft(card.title);
              setIsEditing(false);
            }
          }}
        />
      ) : (
        <p className="kb-card-title" onDoubleClick={() => setIsEditing(true)}>
          {card.title}
        </p>
      )}

      <div className="kb-card-actions">
        <button
          className="kb-icon-btn"
          title="Move left"
          disabled={!canMoveLeft}
          onClick={() => onMove(card.id, COLUMNS[columnIndex - 1])}
        >
          ←
        </button>
        <button className="kb-icon-btn" title="Edit" onClick={() => setIsEditing(true)}>
          ✎
        </button>
        <button
          className="kb-icon-btn"
          title="Move right"
          disabled={!canMoveRight}
          onClick={() => onMove(card.id, COLUMNS[columnIndex + 1])}
        >
          →
        </button>

        {confirmingDelete ? (
          <span className="kb-confirm">
            <button className="kb-confirm-yes" onClick={() => onDelete(card.id)}>
              Delete
         
           </button>
            <button className="kb-confirm-no" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </button>
          </span>
        ) : (
          <button
            className="kb-icon-btn kb-icon-btn-danger"
            title="Delete"
            onClick={() => setConfirmingDelete(true)}
          >
            🗑
          </button>
        )}
      </div>
    </div>
  );
}

// Memoized: a card only re-renders when ITS OWN data changes, not when a
// sibling card moves or when a totally different column updates.
const Card = memo(CardBase, (prev, next) => {
  return (
    prev.card.id === next.card.id &&
    prev.card.title === next.card.title &&
    prev.card.column === next.card.column &&
    prev.onMove === next.onMove &&
    prev.onEdit === next.onEdit &&
    prev.onDelete === next.onDelete
  );
});

export default Card;
