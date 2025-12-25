import { useState, useCallback, useMemo } from 'react';

export const useDataTable = (initialData = [], options = {}) => {
  const {
    defaultSort = null,
    defaultFilters = {},
    pageSize = 10,
    enableSearch = true,
    enableSorting = true,
    enableFiltering = true,
    enablePagination = true
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState(defaultSort);
  const [filters, setFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (enableSearch && searchTerm) {
      result = result.filter(item =>
        Object.values(item).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    if (enableFiltering) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          result = result.filter(item => {
            if (Array.isArray(value)) {
              return value.includes(item[key]);
            }
            return item[key] === value;
          });
        }
      });
    }

    return result;
  }, [data, searchTerm, filters, enableSearch, enableFiltering]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!enableSorting || !sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      if (aValue < bValue) comparison = -1;

      return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
    });
  }, [filteredData, sortConfig, enableSorting]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!enablePagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, enablePagination]);

  // Pagination info
  const paginationInfo = useMemo(() => {
    if (!enablePagination) return null;

    const totalItems = sortedData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    return {
      currentPage,
      totalPages,
      totalItems,
      pageSize,
      from: startIndex + 1,
      to: endIndex,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1,
      pages: Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        const start = Math.max(1, currentPage - 2);
        return start + i;
      }).filter(page => page <= totalPages)
    };
  }, [sortedData.length, currentPage, pageSize, enablePagination]);

  // Handlers
  const handleSort = useCallback((key) => {
    if (!enableSorting) return;

    setSortConfig(prev => {
      if (prev?.key === key) {
        return prev.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  }, [enableSorting]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleRowSelect = useCallback((rowId, checked) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(rowId);
      } else {
        newSet.delete(rowId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedRows(new Set(paginatedData.map(row => row.id)));
    } else {
      setSelectedRows(new Set());
    }
  }, [paginatedData]);

  const clearSelection = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    setSearchTerm('');
    setCurrentPage(1);
  }, [defaultFilters]);

  const refreshData = useCallback(async (fetchFunction) => {
    if (!fetchFunction) return;
    
    setLoading(true);
    try {
      const newData = await fetchFunction();
      setData(newData);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Data
    data: paginatedData,
    allData: data,
    filteredCount: sortedData.length,
    totalCount: data.length,
    loading,
    
    // Search & Filters
    searchTerm,
    filters,
    sortConfig,
    
    // Selection
    selectedRows: Array.from(selectedRows),
    selectedCount: selectedRows.size,
    
    // Pagination
    pagination: paginationInfo,
    
    // Handlers
    setData,
    setLoading,
    handleSort,
    handleSearch,
    handleFilter,
    handlePageChange,
    handleRowSelect,
    handleSelectAll,
    clearSelection,
    clearFilters,
    refreshData,
    
    // Utilities
    isSelected: (rowId) => selectedRows.has(rowId),
    isAllSelected: selectedRows.size === paginatedData.length && paginatedData.length > 0
  };
};