import React, {
  useMemo,
  useReducer,
  useState,
  useCallback,
} from "react";

import { boardReducer, seedBoard, COLUMNS } from "./boardReducer";
import { useOptimisticMove } from "./hooks/useOptimisticMove";
import Column from "./components/Column";
import SearchBox from "./components/SearchBox";
import Toast from "./components/Toast";
import "./styles.css";

export default function App() {
  const [state, dispatch] = useReducer(
    boardReducer,
    undefined,
    seedBoard
  );

  const [query, setQuery] = useState("");

  const moveCard = useOptimisticMove(dispatch);

  const handleEdit = useCallback(
    (id, title) =>
      dispatch({
        type: "EDIT_CARD",
        id,
        title,
      }),
    []
  );

  const handleDelete = useCallback(
    (id) =>
      dispatch({
        type: "DELETE_CARD",
        id,
      }),
    []
  );

  const handleAdd = useCallback(
    (column, title) =>
      dispatch({
        type: "ADD_CARD",
        column,
        title,
      }),
    []
  );

  const handleDismissToast = useCallback(
    (id) =>
      dispatch({
        type: "DISMISS_TOAST",
        id,
      }),
    []
  );

  const allCards = useMemo(
    () => Object.values(state.cards),
    [state.cards]
  );

  const cardsByColumn = useMemo(() => {
    const q = query.trim().toLowerCase();

    const grouped = {
      todo: [],
      inProgress: [],
      done: [],
    };

    for (const card of allCards) {
      if (
        q &&
        !card.title.toLowerCase().includes(q)
      ) {
        continue;
      }

      grouped[card.column].push(card);
    }
    return grouped;
  }, [allCards, query]);

  return (
    <div className="app-background">
      <div className="overlay">
        <div className="kb-app">
          <header className="kb-header">
            <h1>Kanban Board</h1>

            <SearchBox
              value={query}
              onChange={setQuery}
            />
          </header>

          <div className="kb-board">
            {COLUMNS.map((columnId) => (
              <Column
                key={columnId}
                columnId={columnId}
                cards={cardsByColumn[columnId]}
                onMove={moveCard}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAdd}
              />
            ))}
          </div>

          <Toast
            toast={state.toast}
            onDismiss={handleDismissToast}
          />
        </div>
      </div>
    </div>
  );
}