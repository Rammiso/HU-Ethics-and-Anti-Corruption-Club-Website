import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Shield, 
  Eye, 
  MessageSquare, 
  UserCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Download
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { PageLoading } from '../../components/common/Loading';
import { useNotification } from '../../hooks/useNotification';
import { formatDate, formatRelativeTime, truncateText, cn } from '../../utils/helpers';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedReports, setSelectedReports] = useState([]);
  const { showNotification } = useNotification();

  const itemsPerPage = 10;

  const reportStatuses = [
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'INVESTIGATING', label: 'Investigating' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' }
  ];

  const severityLevels = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' }
  ];

  useEffect(() => {
    fetchReports();
  }, [currentPage, searchTerm, statusFilter, severityFilter]);

  const fetchReports = async () => {
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

      if (severityFilter !== 'all') {
        params.append('severity', severityFilter);
      }

      const response = await apiClient.get(`/admin/reports?${params}`);
      const { reports: reportsData, pagination } = response.data;

      setReports(reportsData || []);
      setTotalPages(pagination?.pages || 1);
      setTotalCount(pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load reports'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSeverityFilter = (severity) => {
    setSeverityFilter(severity);
    setCurrentPage(1);
  };

  const handleSelectReport = (reportId) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReports.length === reports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(reports.map(item => item._id));
    }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      await apiClient.put(`/admin/reports/${reportId}/status`, {
        status: newStatus,
        notes: `Status updated to ${newStatus}`
      });
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Report status updated successfully'
      });
      
      fetchReports();
    } catch (error) {
      console.error('Failed to update report status:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update report status'
      });
    }
  };

  const handleAssignReport = async (reportId) => {
    try {
      await apiClient.put(`/admin/reports/${reportId}/assign`, {
        assignedTo: 'current_admin' // This would be the current admin's ID
      });
      
      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Report assigned successfully'
      });
      
      fetchReports();
    } catch (error) {
      console.error('Failed to assign report:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to assign report'
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      SUBMITTED: { 
        color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', 
        label: 'Submitted',
        icon: Clock
      },
      UNDER_REVIEW: { 
        color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', 
        label: 'Under Review',
        icon: Eye
      },
      INVESTIGATING: { 
        color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', 
        label: 'Investigating',
        icon: Search
      },
      RESOLVED: { 
        color: 'bg-green-500/10 text-green-500 border-green-500/20', 
        label: 'Resolved',
        icon: CheckCircle
      },
      CLOSED: { 
        color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', 
        label: 'Closed',
        icon: XCircle
      }
    };

    const config = statusConfig[status] || statusConfig.SUBMITTED;
    const Icon = config.icon;
    
    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border', config.color)}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getSeverityBadge = (severity) => {
    const severityConfig = {
      LOW: { color: 'bg-green-500/10 text-green-500', label: 'Low' },
      MEDIUM: { color: 'bg-yellow-500/10 text-yellow-500', label: 'Medium' },
      HIGH: { color: 'bg-orange-500/10 text-orange-500', label: 'High' },
      CRITICAL: { color: 'bg-red-500/10 text-red-500', label: 'Critical' }
    };

    const config = severityConfig[severity] || severityConfig.MEDIUM;
    
    return (
      <span className={cn('px-2 py-1 text-xs rounded-full', config.color)}>
        {config.label}
      </span>
    );
  };

  if (loading && currentPage === 1) {
    return <PageLoading text="Loading reports..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Reports Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage anonymous reports and investigations
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {reportStatuses.slice(0, 4).map((status) => {
          const count = reports.filter(r => r.status === status.value).length;
          return (
            <div key={status.value} className="glass-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{status.label}</p>
                  <p className="text-2xl font-bold mt-1">{count}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div className="glass-card">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reports by title or tracking ID..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-lg glass border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg glass border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
              >
                <option value="all">All Status</option>
                {reportStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={severityFilter}
              onChange={(e) => handleSeverityFilter(e.target.value)}
              className="px-3 py-2 rounded-lg glass border border-white/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
            >
              <option value="all">All Severity</option>
              {severityLevels.map(severity => (
                <option key={severity.value} value={severity.value}>
                  {severity.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <p className="text-sm text-muted-foreground">
            Showing {reports.length} of {totalCount} reports
          </p>
          
          {selectedReports.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedReports.length} selected
              </span>
              <button className="btn-secondary text-sm">
                Bulk Actions
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reports List */}
      <div className="glass-card">
        {reports.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No reports found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || severityFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No reports have been submitted yet'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-4 border-b border-white/10 text-sm font-medium text-muted-foreground">
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedReports.length === reports.length && reports.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-white/20 bg-transparent focus:ring-neon-green focus:ring-offset-0"
                />
              </div>
              <div className="col-span-3">Report</div>
              <div className="col-span-2">Tracking ID</div>
              <div className="col-span-1">Severity</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/10">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="lg:grid lg:grid-cols-12 gap-4 p-4 hover:bg-accent/50 transition-colors"
                >
                  {/* Mobile Layout */}
                  <div className="lg:hidden space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedReports.includes(report._id)}
                          onChange={() => handleSelectReport(report._id)}
                          className="mt-1 rounded border-white/20 bg-transparent focus:ring-neon-green focus:ring-offset-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{report.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            ID: {report.trackingId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {truncateText(report.description || '', 100)}
                          </p>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-accent rounded">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(report.severity)}
                          {getStatusBadge(report.status)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatRelativeTime(report.createdAt)}
                        </span>
                      </div>
                      
                      {report.assignedTo && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <UserCheck className="w-3 h-3" />
                          Assigned to {report.assignedTo.name}
                        </div>
                      )}
                      
                      {report.evidence && report.evidence.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Download className="w-3 h-3" />
                          {report.evidence.length} evidence file(s)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:contents">
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report._id)}
                        onChange={() => handleSelectReport(report._id)}
                        className="rounded border-white/20 bg-transparent focus:ring-neon-green focus:ring-offset-0"
                      />
                    </div>
                    
                    <div className="col-span-3 flex items-center">
                      <div className="min-w-0">
                        <h3 className="font-medium truncate">{report.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {truncateText(report.description || '', 60)}
                        </p>
                        {report.assignedTo && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <UserCheck className="w-3 h-3" />
                            {report.assignedTo.name}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-span-2 flex items-center">
                      <div className="font-mono text-sm">
                        {report.trackingId}
                      </div>
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      {getSeverityBadge(report.severity)}
                    </div>
                    
                    <div className="col-span-2 flex items-center">
                      {getStatusBadge(report.status)}
                    </div>
                    
                    <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                      <div>
                        <div>{formatDate(report.createdAt)}</div>
                        <div className="text-xs">
                          {formatRelativeTime(report.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <div className="flex items-center gap-1">
                        <button
                          className="p-1 hover:bg-accent rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          className="p-1 hover:bg-accent rounded transition-colors"
                          title="Add Message"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        
                        {!report.assignedTo && (
                          <button
                            onClick={() => handleAssignReport(report._id)}
                            className="p-1 hover:bg-primary/10 hover:text-primary rounded transition-colors"
                            title="Assign to Me"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
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

export default ReportsPage;