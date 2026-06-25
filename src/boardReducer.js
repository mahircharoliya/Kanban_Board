// boardReducer.js
// Single source of truth for the Kanban board.
// Cards are stored in a flat map (by id) so moving a card never requires
// touching the other cards' objects -> good memoization, no array surgery.

export const COLUMNS = ["todo", "inProgress", "done"];

export const COLUMN_LABELS = {
  todo: "To Do",
  inProgress: "In Progress",
  done: "Done",
};

let idCounter = 100;
export const nextId = () => `card-${idCounter++}`;

export function seedBoard() {
  return {
    // cards: { [id]: { id, title, column } }
    cards: {
      "card-1": { id: "card-1", title: "Design login screen", column: "todo" },
      "card-2": { id: "card-2", title: "Write API spec", column: "todo" },
      "card-3": { id: "card-3", title: "Set up CI pipeline", column: "inProgress" },
      "card-4": { id: "card-4", title: "Refactor auth module", column: "inProgress" },
      "card-5": { id: "card-5", title: "Fix navbar bug", column: "done" },
      "card-6": { id: "card-6", title: "Onboard new dev", column: "done" },
    },
    // pendingMoves tracks in-flight optimistic moves keyed by cardId so that
    // overlapping moves on different cards never clash, and a rollback only
    // ever restores the column that THAT specific move actually changed.
    pendingMoves: {}, // { [cardId]: previousColumn }
    toast: null, // { id, message, kind }
  };
}

let toastCounter = 0;

export function boardReducer(state, action) {
  switch (action.type) {
    case "ADD_CARD": {
      const id = nextId();
      return {
        ...state,
        cards: {
          ...state.cards,
          [id]: { id, title: action.title, column: action.column },
        },
      };
    }

    case "EDIT_CARD": {
      const card = state.cards[action.id];
      if (!card) return state;
      return {
        ...state,
        cards: {
          ...state.cards,
          [action.id]: { ...card, title: action.title },
        },
      };
    }

    case "DELETE_CARD": {
      const { [action.id]: _removed, ...rest } = state.cards;
      return { ...state, cards: rest };
    }

    // Step 1 of the optimistic flow: move the card immediately and
    // remember where it came from, keyed by card id (not a single global
    // "previous state"), so a second move started before the first
    // resolves can never overwrite the first move's rollback info.
    case "MOVE_CARD_OPTIMISTIC": {
      const card = state.cards[action.id];
      if (!card || card.column === action.toColumn) return state;
      return {
        ...state,
        cards: {
          ...state.cards,
          [action.id]: { ...card, column: action.toColumn },
        },
        pendingMoves: {
          ...state.pendingMoves,
          [action.id]: card.column, // remember original column for rollback
        },
      };
    }

    // Step 2a: save succeeded -> just clear the pending flag for this card.
    case "MOVE_CARD_CONFIRMED": {
      const { [action.id]: _done, ...remainingPending } = state.pendingMoves;
      return { ...state, pendingMoves: remainingPending };
    }

    // Step 2b: save failed -> restore exactly the original column for THIS
    // card only, even if other moves are still pending elsewhere.
    case "MOVE_CARD_ROLLBACK": {
      const card = state.cards[action.id];
      const originalColumn = state.pendingMoves[action.id];
      if (!card || originalColumn === undefined) return state;
      const { [action.id]: _done, ...remainingPending } = state.pendingMoves;
      return {
        ...state,
        cards: {
          ...state.cards,
          [action.id]: { ...card, column: originalColumn },
        },
        pendingMoves: remainingPending,
      };
    }

    case "SHOW_TOAST": {
      return {
        ...state,
        toast: { id: ++toastCounter, message: action.message, kind: action.kind || "error" },
      };
    }

    case "DISMISS_TOAST": {
      if (state.toast && state.toast.id !== action.id) return state; // already replaced
      return { ...state, toast: null };
    }

    default:
      return state;
  }
}
