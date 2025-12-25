import React from 'react';
import { ChevronUp, ChevronDown, Search, Filter, MoreHorizontal } from 'lucide-react';
import { cn } from '../../utils/helpers';
import Button from './Button';
import Input from './Input';
import { SkeletonTable } from './Skeleton';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  pagination,
  sorting,
  filtering,
  selection,
  actions,
  className = '',
  emptyMessage = 'No data available',
  rowClassName,
  onRowClick
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState(sorting?.defaultSort || null);
  const [selectedRows, setSelectedRows] = React.useState(new Set());

  // Handle sorting
  const handleSort = (columnKey) => {
    if (!sorting?.enabled) return;

    let direction = 'asc';
    if (sortConfig?.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const newSortConfig = { key: columnKey, direction };
    setSortConfig(newSortConfig);
    sorting?.onSort?.(newSortConfig);
  };

  // Handle row selection
  const handleRowSelect = (rowId, checked) => {
    if (!selection?.enabled) return;

    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    setSelectedRows(newSelected);
    selection?.onSelectionChange?.(Array.from(newSelected));
  };

  const handleSelectAll = (checked) => {
    if (!selection?.enabled) return;

    const newSelected = checked ? new Set(data.map(row => row.id)) : new Set();
    setSelectedRows(newSelected);
    selection?.onSelectionChange?.(Array.from(newSelected));
  };

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!searchTerm || !filtering?.enabled) return data;

    return data.filter(row =>
      columns.some(column => {
        const value = row[column.key];
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns, filtering?.enabled]);

  if (loading) {
    return (
      <div className={cn('glass-card', className)}>
        <SkeletonTable rows={5} columns={columns.length} />
      </div>
    );
  }

  return (
    <div className={cn('glass-card overflow-hidden', className)}>
      {/* Header with search and filters */}
      {(filtering?.enabled || actions?.header) && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {filtering?.enabled && (
                <div className="relative">
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={Search}
                    className="w-64"
                  />
                </div>
              )}
              
              {filtering?.customFilters && (
                <Button variant="outline" leftIcon={Filter}>
                  Filters
                </Button>
              )}
            </div>
            
            {actions?.header && (
              <div className="flex items-center gap-2">
                {actions.header}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/20">
            <tr>
              {selection?.enabled && (
                <th className="w-12 p-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'text-left p-4 font-medium text-sm',
                    column.sortable && sorting?.enabled && 'cursor-pointer hover:bg-muted/30 transition-colors',
                    column.width && `w-${column.width}`
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {column.sortable && sorting?.enabled && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={cn(
                            'w-3 h-3',
                            sortConfig?.key === column.key && sortConfig.direction === 'asc'
                              ? 'text-neon-green' 
                              : 'text-muted-foreground'
                          )} 
                        />
                        <ChevronDown 
                          className={cn(
                            'w-3 h-3 -mt-1',
                            sortConfig?.key === column.key && sortConfig.direction === 'desc'
                              ? 'text-neon-green' 
                              : 'text-muted-foreground'
                          )} 
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              
              {actions?.row && (
                <th className="w-12 p-4">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (selection?.enabled ? 1 : 0) + (actions?.row ? 1 : 0)}
                  className="p-8 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={cn(
                    'border-b border-white/5 hover:bg-muted/10 transition-colors',
                    onRowClick && 'cursor-pointer',
                    typeof rowClassName === 'function' ? rowClassName(row) : rowClassName
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selection?.enabled && (
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={(e) => handleRowSelect(row.id, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300"
                      />
                    </td>
                  )}
                  
                  {columns.map((column) => (
                    <td key={column.key} className="p-4">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                  
                  {actions?.row && (
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          actions.row(row);
                        }}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination?.enabled && (
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {pagination.from} to {pagination.to} of {pagination.total} results
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevious}
                onClick={pagination.onPrevious}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {pagination.pages?.map((page) => (
                  <Button
                    key={page}
                    variant={page === pagination.currentPage ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => pagination.onPageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNext}
                onClick={pagination.onNext}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;