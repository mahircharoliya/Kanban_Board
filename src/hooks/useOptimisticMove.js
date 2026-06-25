// useOptimisticMove.js
// Encapsulates the "optimistic update + async save + rollback" flow so
// components stay purely about rendering. Reusable anywhere a card needs
// to move.
import { useCallback, useRef } from "react";
import { saveMove } from "../api";

export function useOptimisticMove(dispatch) {
  // Track in-flight request ids per card so a stale response from an
  // earlier move can't clobber a newer one on the same card.
  const requestTokens = useRef({});

  const moveCard = useCallback(
    (cardId, toColumn) => {
      // 1. Apply the move immediately (optimistic UI).
      dispatch({ type: "MOVE_CARD_OPTIMISTIC", id: cardId, toColumn });

      const token = Symbol("move");
      requestTokens.current[cardId] = token;

      // 2. Fire the fake network call.
      saveMove(cardId, toColumn)
        .then(() => {
          // Only confirm if this is still the latest move for this card.
          if (requestTokens.current[cardId] === token) {
            dispatch({ type: "MOVE_CARD_CONFIRMED", id: cardId });
          }
        })
        .catch(() => {
          if (requestTokens.current[cardId] === token) {
            dispatch({ type: "MOVE_CARD_ROLLBACK", id: cardId });
            dispatch({
              type: "SHOW_TOAST",
              message: "Couldn't save the move — card was reverted.",
              kind: "error",
            });
          }
        });
    },
    [dispatch]
  );

  return moveCard;
}
