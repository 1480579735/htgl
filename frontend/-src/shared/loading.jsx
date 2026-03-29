import React from 'react';

export default function Loading({ text = '加载中...' }) {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>{text}</p>
    </div>
  );
}