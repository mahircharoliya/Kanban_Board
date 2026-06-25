// api.js
// Simulated backend call. Resolves after ~600ms, rejects ~20% of the time.
export function saveMove(cardId, toColumn) {
  return new Promise((resolve, reject) => {
    const delay = 500 + Math.random() * 200; // ~600ms +/- jitter
    setTimeout(() => {
      if (Math.random() < 0.2) {
        reject(new Error("Failed to save move"));
      } else {
        resolve({ cardId, toColumn });
      }
    }, delay);
  });
}
