// SearchBox.jsx
import React from "react";

export default function SearchBox({ value, onChange }) {
  return (
    <input
      className="kb-search"
      type="search"
      placeholder="Search cards by title..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
