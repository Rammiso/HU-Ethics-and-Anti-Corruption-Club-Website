import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  FileText,
  Calendar,
  User,
  Globe,
  EyeOff
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { PageLoading } from '../../components/common/Loading';
import { useNotification } from '../../hooks/useNotification';
import { formatDate, formatRelativeTime, truncateText, cn } from '../../utils/helpers';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedNews, setSelectedNews] = useState([]);
  const { showNotification } = useNotification();

  const itemsPerPage = 10;

  useEffect(() => {
    fetchNews();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await apiClient.get(`/admin/news?${params}`);
      const { news: newsData, pagination } = response.data;

      setNews(newsData || []);
      setTotalPages(pagination?.pages || 1);
      setTotalCount(pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch news:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load news articles'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSelectNews = (newsId) => {
    setSelectedNews(prev => 
      prev.includes(newsId) 
        ? prev.filter(id => id !== newsId)
        : [...prev, newsId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNews.length === news.length) {
      setSelectedNews([]);
    } else {
      setSelectedNews(news.map(item => item._id));
    }
  };

  const handlePublishToggle = async (newsId, currentStatus) => {
    try {
      const action = currentStatus === 'PUBLISHED' ? 'unpublish' : 'publish';
      await apiClient.put(`/admin/news/${newsId}/${action}`);
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: `News article ${action}ed successfully`
      });
      
      fetchNews(); // Refresh the list
    } catch (error) {
      console.error(`Failed to ${action} news:`, error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: `Failed to ${action} news article`
      });
    }
  };

  const handleDelete = async (newsId) => {
    if (!confirm('Are you sure you want to delete this news article?')) {
      return;
    }

    try {
      await apiClient.delete(`/admin/news/${newsId}`);
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: 'News article deleted successfully'
      });
      
      fetchNews(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete news:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete news article'
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', label: 'Draft' },
      PUBLISHED: { color: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'Published' }
    };

    const config = statusConfig[status] || statusConfig.DRAFT;
    
    return (
      <span className={cn('px-2 py-1 text-xs rounded-full border', config.color)}>
        {config.label}
      </span>
    );
  };

  if (loading && currentPage === 1) {
    return <PageLoading text="Loading news articles..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">News Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage news articles and announcements
          </p>
        </div>
        
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create News
        </button>
      </div>

      {/* Filters and Search */}
      <div className="glass-card">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search news articles..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-lg glass border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg glass border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <p className="text-sm text-muted-foreground">
            Showing {news.length} of {totalCount} articles
          </p>
          
          {selectedNews.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedNews.length} selected
              </span>
              <button className="btn-secondary text-sm">
                Bulk Actions
              </button>
            </div>
          )}
        </div>
      </div>

      {/* News List */}
      <div className="glass-card">
        {news.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No news articles found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first news article to get started'
              }
            </p>
            <button className="btn-primary">
              Create News Article
            </button>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-4 border-b border-white/10 text-sm font-medium text-muted-foreground">
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedNews.length === news.length && news.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-white/20 bg-transparent focus:ring-neon-green focus:ring-offset-0"
                />
              </div>
              <div className="col-span-4">Title</div>
              <div className="col-span-2">Author</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/10">
              {news.map((article) => (
                <div
                  key={article._id}
                  className="lg:grid lg:grid-cols-12 gap-4 p-4 hover:bg-accent/50 transition-colors"
                >
                  {/* Mobile Layout */}
                  <div className="lg:hidden space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedNews.includes(article._id)}
                          onChange={() => handleSelectNews(article._id)}
                          className="mt-1 rounded border-white/20 bg-transparent focus:ring-neon-green focus:ring-offset-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{article.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {truncateText(article.excerpt || '', 100)}
                          </p>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-accent rounded">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <User className="w-3 h-3" />
                          {article.author?.name || 'Unknown'}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatRelativeTime(article.createdAt)}
                        </div>
                      </div>
                      {getStatusBadge(article.status)}
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:contents">
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedNews.includes(article._id)}
                        onChange={() => handleSelectNews(article._id)}
                        className="rounded border-white/20 bg-transparent focus:ring-neon-green focus:ring-offset-0"
                      />
                    </div>
                    
                    <div className="col-span-4 flex items-center">
                      <div className="min-w-0">
                        <h3 className="font-medium truncate">{article.title}</h3>
                        {article.excerpt && (
                          <p className="text-sm text-muted-foreground truncate">
                            {truncateText(article.excerpt, 80)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                      {article.author?.name || 'Unknown'}
                    </div>
                    
                    <div className="col-span-2 flex items-center">
                      {getStatusBadge(article.status)}
                    </div>
                    
                    <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                      {formatRelativeTime(article.createdAt)}
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePublishToggle(article._id, article.status)}
                          className="p-1 hover:bg-accent rounded transition-colors"
                          title={article.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                        >
                          {article.status === 'PUBLISHED' ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Globe className="w-4 h-4" />
                          )}
                        </button>
                        
                        <button
                          className="p-1 hover:bg-accent rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(article._id)}
                          className="p-1 hover:bg-error-500/10 hover:text-error-500 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      'w-8 h-8 rounded text-sm transition-colors',
                      currentPage === pageNum
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsPage;