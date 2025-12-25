import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter } from 'lucide-react';
import { newsService } from '../../services/newsService';
import { useNotification } from '../../hooks/useNotification';
import { useDataTable } from '../../hooks/useDataTable';
import { formatDate, formatRelativeTime } from '../../utils/helpers';
import { NEWS_STATUS } from '../../utils/constants';
import Button from '../ui/Button';
import DataTable from '../ui/DataTable';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import NewsForm from './NewsForm';

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingNews, setDeletingNews] = useState(null);
  
  const { success, error } = useNotification();
  
  const {
    data: tableData,
    pagination,
    handleSort,
    handleSearch,
    handleFilter,
    handlePageChange,
    selectedRows,
    handleRowSelect,
    handleSelectAll,
    clearSelection,
    refreshData
  } = useDataTable(news, {
    pageSize: 10,
    enableSearch: true,
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true
  });

  // Fetch news data
  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsService.getNews();
      const newsData = response.data?.news || response.news || [];
      setNews(newsData);
      return newsData;
    } catch (err) {
      console.error('Failed to fetch news:', err);
      error('Error', 'Failed to load news articles');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Handle create news
  const handleCreate = () => {
    setEditingNews(null);
    setShowForm(true);
  };

  // Handle edit news
  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);
    setShowForm(true);
  };

  // Handle delete news
  const handleDelete = (newsItem) => {
    setDeletingNews(newsItem);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingNews) return;

    try {
      await newsService.deleteNews(deletingNews.id);
      success('Success', 'News article deleted successfully');
      await refreshData(fetchNews);
      setShowDeleteModal(false);
      setDeletingNews(null);
    } catch (err) {
      console.error('Failed to delete news:', err);
      error('Error', 'Failed to delete news article');
    }
  };

  // Handle toggle publish status
  const handleTogglePublish = async (newsItem) => {
    try {
      await newsService.togglePublishStatus(newsItem.id);
      const newStatus = newsItem.status === 'published' ? 'draft' : 'published';
      success('Success', `News article ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
      await refreshData(fetchNews);
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
      error('Error', 'Failed to update news status');
    }
  };

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      if (editingNews) {
        await newsService.updateNews(editingNews.id, formData);
        success('Success', 'News article updated successfully');
      } else {
        await newsService.createNews(formData);
        success('Success', 'News article created successfully');
      }
      
      setShowForm(false);
      setEditingNews(null);
      await refreshData(fetchNews);
    } catch (err) {
      console.error('Failed to save news:', err);
      throw err; // Let the form handle the error
    }
  };

  // Handle bulk operations
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;

    try {
      await newsService.bulkDelete(selectedRows);
      success('Success', `${selectedRows.length} news articles deleted successfully`);
      clearSelection();
      await refreshData(fetchNews);
    } catch (err) {
      console.error('Failed to bulk delete:', err);
      error('Error', 'Failed to delete selected articles');
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedRows.length === 0) return;

    try {
      await newsService.bulkUpdateStatus(selectedRows, status);
      success('Success', `${selectedRows.length} news articles updated successfully`);
      clearSelection();
      await refreshData(fetchNews);
    } catch (err) {
      console.error('Failed to bulk update status:', err);
      error('Error', 'Failed to update selected articles');
    }
  };

  // Table columns configuration
  const columns = [
    {
      key: 'title',
      title: 'Title',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-sm">{value}</div>
          <div className="text-xs text-muted-foreground">{row.slug}</div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value) => {
        const statusConfig = {
          draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
          scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-800' },
          published: { label: 'Published', className: 'bg-green-100 text-green-800' },
          archived: { label: 'Archived', className: 'bg-yellow-100 text-yellow-800' }
        };
        
        const config = statusConfig[value] || statusConfig.draft;
        
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${config.className}`}>
            {config.label}
          </span>
        );
      }
    },
    {
      key: 'author',
      title: 'Author',
      sortable: true,
      render: (value) => value?.name || 'Unknown'
    },
    {
      key: 'publishDate',
      title: 'Publish Date',
      sortable: true,
      render: (value) => value ? formatDate(value) : 'Not set'
    },
    {
      key: 'createdAt',
      title: 'Created',
      sortable: true,
      render: (value) => formatRelativeTime(value)
    }
  ];

  // Status filter options
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">News Management</h1>
          <p className="text-muted-foreground">Manage news articles and announcements</p>
        </div>
        <Button onClick={handleCreate} leftIcon={Plus}>
          Create News
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{news.filter(n => n.status === 'published').length}</div>
            <div className="text-sm text-muted-foreground">Published</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{news.filter(n => n.status === 'draft').length}</div>
            <div className="text-sm text-muted-foreground">Drafts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{news.filter(n => n.status === 'scheduled').length}</div>
            <div className="text-sm text-muted-foreground">Scheduled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{news.length}</div>
            <div className="text-sm text-muted-foreground">Total Articles</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        data={tableData}
        columns={columns}
        loading={loading}
        pagination={{
          enabled: true,
          ...pagination,
          onPageChange: handlePageChange,
          onNext: () => handlePageChange(pagination.currentPage + 1),
          onPrevious: () => handlePageChange(pagination.currentPage - 1)
        }}
        sorting={{
          enabled: true,
          onSort: handleSort
        }}
        filtering={{
          enabled: true,
          customFilters: (
            <Select
              placeholder="Filter by status"
              options={statusOptions}
              onChange={(e) => handleFilter('status', e.target.value)}
            />
          )
        }}
        selection={{
          enabled: true,
          onSelectionChange: (selected) => {
            // Handle selection change if needed
          }
        }}
        actions={{
          header: selectedRows.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusUpdate('published')}
              >
                Publish Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusUpdate('draft')}
              >
                Unpublish Selected
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
            </div>
          ),
          row: (row) => (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(row)}
                leftIcon={Edit}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTogglePublish(row)}
                leftIcon={row.status === 'published' ? EyeOff : Eye}
              >
                {row.status === 'published' ? 'Unpublish' : 'Publish'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(row)}
                leftIcon={Trash2}
                className="text-error-500 hover:text-error-600"
              >
                Delete
              </Button>
            </div>
          )
        }}
        onRowClick={handleEdit}
        emptyMessage="No news articles found. Create your first article to get started."
      />

      {/* News Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingNews(null);
        }}
        title={editingNews ? 'Edit News Article' : 'Create News Article'}
        size="xl"
      >
        <NewsForm
          initialData={editingNews}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingNews(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingNews(null);
        }}
        title="Delete News Article"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setDeletingNews(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete "{deletingNews?.title}"? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default NewsList;