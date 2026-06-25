// Column.jsx
import React, { memo, useState } from "react";
import Card from "./Card";
import { COLUMN_LABELS } from "../boardReducer";

function ColumnBase({ columnId, cards, onMove, onEdit, onDelete, onAdd }) {
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  function commitAdd() {
    const trimmed = draft.trim();
    if (trimmed) onAdd(columnId, trimmed);
    setDraft("");
    setIsAdding(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    const cardId = e.dataTransfer.getData("text/card-id");
    if (cardId) onMove(cardId, columnId);
  }

  return (
    <div
      className={`kb-column${isDragOver ? " kb-column-dragover" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="kb-column-header">
        <h2>{COLUMN_LABELS[columnId]}</h2>
        <span className="kb-count-badge">{cards.length}</span>
      </div>

      <div className="kb-column-body">
        {cards.map((card) => (
          <Card key={card.id} card={card} onMove={onMove} onEdit={onEdit} onDelete={onDelete} />
        ))}
        {cards.length === 0 && <p className="kb-empty">No cards</p>}
      </div>

      {isAdding ? (
        <div className="kb-add-form">
          <input
            autoFocus
            placeholder="Card title..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitAdd();
              if (e.key === "Escape") {
                setDraft("");
                setIsAdding(false);
              }
            }}
          />
          <div className="kb-add-form-actions">
            <button onClick={commitAdd}>Add</button>
            <button onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="kb-add-btn" onClick={() => setIsAdding(true)}>
          + Add card
        </button>
      )}
    </div>
  );
}

// Memoized: a column only re-renders when its own card list (array
// reference + contents) or handlers change — e.g. moving a card out of
// "To Do" re-renders "To Do" and "In Progress", but never "Done".
const Column = memo(ColumnBase);

export default Column;
