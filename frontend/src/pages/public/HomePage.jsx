import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Calendar,
  ArrowRight,
  ExternalLink,
  Clock,
  MapPin,
} from "lucide-react";
import { apiClient } from "../../services/api";
import Loading, { InlineLoading } from "../../components/common/Loading";
import {
  formatDate,
  formatRelativeTime,
  truncateText,
} from "../../utils/helpers";
import { cn } from "../../utils/helpers";

const HomePage = () => {
  const [newsData, setNewsData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch news and events in parallel
        const [newsPromise, eventsPromise] = await Promise.allSettled([
          fetchNews(),
          fetchEvents(),
        ]);

        // Handle results
        if (newsPromise.status === "fulfilled") {
          setNewsData(newsPromise.value);
        } else {
          console.error("Failed to fetch news:", newsPromise.reason);
        }

        if (eventsPromise.status === "fulfilled") {
          setEventsData(eventsPromise.value);
        } else {
          console.error("Failed to fetch events:", eventsPromise.reason);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchNews = async () => {
    try {
      setNewsLoading(true);
      const response = await apiClient.get("/public/news/published?limit=6");
      return response.data?.news || [];
    } catch (error) {
      console.error("News fetch error:", error);
      return [];
    } finally {
      setNewsLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const response = await apiClient.get("/public/events/upcoming?limit=6");
      return response.data?.events || [];
    } catch (error) {
      console.error("Events fetch error:", error);
      return [];
    } finally {
      setEventsLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold font-display mb-6">
              Promoting <span className="neon-text">Ethics</span> & Fighting{" "}
              <span className="neon-text">Corruption</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Haramaya University Ethics and Anti-Corruption Club is dedicated
              to fostering transparency, accountability, and ethical conduct
              within our academic community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="#news"
                className="btn-primary flex items-center gap-2 justify-center"
              >
                <FileText className="w-5 h-5" />
                Latest News
              </Link>
              <Link
                to="#events"
                className="btn-secondary flex items-center gap-2 justify-center"
              >
                <Calendar className="w-5 h-5" />
                Upcoming Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold font-display mb-2">
                Latest News
              </h3>
              <p className="text-muted-foreground">
                Stay updated with our latest announcements and activities
              </p>
            </div>
            {newsData.length > 0 && (
              <Link
                to="/news"
                className="text-neon-green hover:text-neon-green/80 transition-colors flex items-center gap-2"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {newsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card animate-pulse">
                  <div className="h-48 bg-muted rounded-lg mb-4" />
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : newsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsData.map((article, index) => (
                <article
                  key={article.id || index}
                  className="glass-card hover-lift group cursor-pointer"
                >
                  {article.featuredImage && (
                    <div className="aspect-video rounded-lg overflow-hidden mb-4">
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatRelativeTime(
                        article.publishDate || article.createdAt
                      )}
                    </div>

                    <h4 className="text-lg font-semibold group-hover:text-neon-green transition-colors">
                      {article.title || `News Article ${index + 1}`}
                    </h4>

                    {article.excerpt && (
                      <p className="text-muted-foreground text-sm">
                        {truncateText(article.excerpt, 120)}
                      </p>
                    )}

                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {article.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">
                        By {article.author?.name || "HUEACC"}
                      </span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-neon-green transition-colors" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h4 className="text-lg font-semibold mb-2">No News Available</h4>
              <p className="text-muted-foreground">
                Check back later for the latest updates and announcements.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold font-display mb-2">
                Upcoming Events
              </h3>
              <p className="text-muted-foreground">
                Join us in our upcoming activities and workshops
              </p>
            </div>
            {eventsData.length > 0 && (
              <Link
                to="/events"
                className="text-neon-green hover:text-neon-green/80 transition-colors flex items-center gap-2"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {eventsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card animate-pulse">
                  <div className="h-32 bg-muted rounded-lg mb-4" />
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : eventsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventsData.map((event, index) => (
                <article
                  key={event.id || index}
                  className="glass-card hover-lift group cursor-pointer"
                >
                  {event.featuredImage && (
                    <div className="aspect-video rounded-lg overflow-hidden mb-4">
                      <img
                        src={event.featuredImage}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(event.startDate)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {truncateText(event.location, 20)}
                        </div>
                      )}
                    </div>

                    <h4 className="text-lg font-semibold group-hover:text-neon-blue transition-colors">
                      {event.title || `Event ${index + 1}`}
                    </h4>

                    {event.description && (
                      <p className="text-muted-foreground text-sm">
                        {truncateText(event.description, 120)}
                      </p>
                    )}

                    {event.eventType && (
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-accent text-accent-foreground">
                        {event.eventType.replace("_", " ")}
                      </span>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">
                        {event.capacity
                          ? `${event.capacity} seats`
                          : "Open event"}
                      </span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-neon-blue transition-colors" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h4 className="text-lg font-semibold mb-2">No Upcoming Events</h4>
              <p className="text-muted-foreground">
                Stay tuned for exciting events and workshops coming soon.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
