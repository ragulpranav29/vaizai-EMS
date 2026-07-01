import React, { useState } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from './Button';

interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export const Table = <T extends { id: string | number }>({
  columns,
  data,
  emptyMessage = 'No records found.',
  onRowClick
}: TableProps<T>) => {
  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table className="app-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr 
                key={row.id} 
                onClick={() => onRowClick && onRowClick(row)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx}>
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchKey?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  itemsPerPage?: number;
  onRowClick?: (row: T) => void;
}

export const DataTable = <T extends { id: string | number }>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search records...',
  emptyMessage,
  itemsPerPage = 10,
  onRowClick
}: DataTableProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Search filter
  const filteredData = data.filter((row) => {
    if (!searchKey || !searchQuery) return true;
    const val = (row as any)[searchKey];
    if (val === undefined || val === null) return false;
    return val.toString().toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Sort logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    let valA = (a as any)[sortField] ?? '';
    let valB = (b as any)[sortField] ?? '';
    
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination bounds
  const totalItems = sortedData.length;
  const totalPages = Math.max(Math.ceil(totalItems / itemsPerPage), 1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Top Search Bar */}
      {searchKey && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxWidth: '320px' }}>
          <Search size={14} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{ background: 'none', border: 'none', padding: 0, outline: 'none', fontSize: '13px', width: '100%', color: '#fff' }}
          />
        </div>
      )}

      {/* Table Container */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="app-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    onClick={() => col.sortable && handleSort(col.key)}
                    style={{ cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {col.header}
                      {col.sortable && <ArrowUpDown size={10} style={{ opacity: sortField === col.key ? 1 : 0.4 }} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                    {emptyMessage || 'No records match search parameters.'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {columns.map((col, colIdx) => (
                      <td key={colIdx}>
                        {col.render ? col.render(row) : (row as any)[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} entries
          </span>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{ minWidth: '40px', padding: '4px 8px' }}
            >
              <ChevronLeft size={14} />
            </Button>
            
            <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{ minWidth: '40px', padding: '4px 8px' }}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
