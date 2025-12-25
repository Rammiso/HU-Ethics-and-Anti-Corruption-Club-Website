import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Calendar,
  Shield,
  MessageSquare,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '../../services/api';
import Loading, { PageLoading } from '../../components/common/Loading';
import { cn } from '../../utils/helpers';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [eventsData, setEventsData] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard summary
        const dashboardResponse = await apiClient.get('/admin/dashboard');
        setDashboardData(dashboardResponse.data);

        // Fetch recent news (example integration)
        try {
          const newsResponse = await apiClient.get('/public/news/published?limit=5');
          setNewsData(newsResponse.data?.news || []);
        } catch (newsError) {
          console.warn('Failed to fetch news:', newsError);
          setNewsData([]);
        }

        // Fetch upcoming events (example integration)
        try {
          const eventsResponse = await apiClient.get('/public/events/upcoming?limit=5');
          setEventsData(eventsResponse.data?.events || []);
        } catch (eventsError) {
          console.warn('Failed to fetch events:', eventsError);
          setEventsData([]);
        }

      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <PageLoading text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-error-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Mock data for demonstration (replace with real API data)
  const stats = dashboardData || {
    totalReports: 156,
    pendingReports: 23,
    totalNews: 45,
    totalEvents: 12,
    totalUsers: 8,
    totalMessages: 89
  };

  const statCards = [
    {
      title: 'Total Reports',
      value: stats.totalReports || 0,
      change: '+12%',
      changeType: 'positive',
      icon: Shield,
      color: 'from-neon-green to-green-400'
    },
    {
      title: 'Pending Reports',
      value: stats.pendingReports || 0,
      change: '-5%',
      changeType: 'negative',
      icon: AlertCircle,
      color: 'from-yellow-400 to-orange-400'
    },
    {
      title: 'News Articles',
      value: stats.totalNews || 0,
      change: '+8%',
      changeType: 'positive',
      icon: FileText,
      color: 'from-blue-400 to-cyan-400'
    },
    {
      title: 'Events',
      value: stats.totalEvents || 0,
      change: '+15%',
      changeType: 'positive',
      icon: Calendar,
      color: 'from-purple-400 to-pink-400'
    },
    {
      title: 'Admin Users',
      value: stats.totalUsers || 0,
      change: '0%',
      changeType: 'neutral',
      icon: Users,
      color: 'from-indigo-400 to-blue-400'
    },
    {
      title: 'Messages',
      value: stats.totalMessages || 0,
      change: '+3%',
      changeType: 'positive',
      icon: MessageSquare,
      color: 'from-teal-400 to-green-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's what's happening with your system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="glass-card hover-lift group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className={cn(
                      'w-4 h-4 mr-1',
                      stat.changeType === 'positive' ? 'text-success-500' :
                      stat.changeType === 'negative' ? 'text-error-500' :
                      'text-muted-foreground'
                    )} />
                    <span className={cn(
                      'text-sm font-medium',
                      stat.changeType === 'positive' ? 'text-success-500' :
                      stat.changeType === 'negative' ? 'text-error-500' :
                      'text-muted-foreground'
                    )}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      from last month
                    </span>
                  </div>
                </div>
                <div className={cn(
                  'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
                  'group-hover:scale-110 transition-transform duration-200',
                  stat.color
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent News */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent News</h3>
            <button className="text-sm text-primary hover:text-primary/80 transition-colors">
              View All
            </button>
          </div>
          
          {newsData.length > 0 ? (
            <div className="space-y-3">
              {newsData.slice(0, 5).map((article, index) => (
                <div
                  key={article.id || index}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-neon-green mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {article.title || `News Article ${index + 1}`}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {article.publishDate ? new Date(article.publishDate).toLocaleDateString() : 'Recently published'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent news articles</p>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Upcoming Events</h3>
            <button className="text-sm text-primary hover:text-primary/80 transition-colors">
              View All
            </button>
          </div>
          
          {eventsData.length > 0 ? (
            <div className="space-y-3">
              {eventsData.slice(0, 5).map((event, index) => (
                <div
                  key={event.id || index}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-neon-blue mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {event.title || `Event ${index + 1}`}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'Coming soon'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No upcoming events</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="btn-neon flex flex-col items-center gap-2 p-4 h-auto">
            <Shield className="w-6 h-6" />
            <span className="text-sm">View Reports</span>
          </button>
          <button className="btn-neon flex flex-col items-center gap-2 p-4 h-auto">
            <FileText className="w-6 h-6" />
            <span className="text-sm">Create News</span>
          </button>
          <button className="btn-neon flex flex-col items-center gap-2 p-4 h-auto">
            <Calendar className="w-6 h-6" />
            <span className="text-sm">Add Event</span>
          </button>
          <button className="btn-neon flex flex-col items-center gap-2 p-4 h-auto">
            <BarChart3 className="w-6 h-6" />
            <span className="text-sm">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;