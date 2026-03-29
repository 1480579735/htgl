import React from 'react';

export default function Table({ columns, data, loading, emptyText = '暂无数据' }) {
  if (loading) {
    return <div className="loading">加载中...</div>;
  }
  
  if (!data || data.length === 0) {
    return <div className="empty">{emptyText}</div>;
  }
  
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{ width: col.width }}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}