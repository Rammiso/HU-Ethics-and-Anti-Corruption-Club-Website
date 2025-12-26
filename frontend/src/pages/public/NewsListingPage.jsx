import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, ArrowRight, Search } from "lucide-react";
import { apiClient } from "../../services/api";
import { PageLoading } from "../../components/common/Loading";
import {
  formatDate,
  formatRelativeTime,
  truncateText,
} from "../../utils/helpers";
import Input from "../../components/ui/Input";

const NewsListingPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredNews, setFilteredNews] = useState([]);

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = news.filter(
        (article) =>
          article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.tags?.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
      setFilteredNews(filtered);
    } else {
      setFilteredNews(news);
    }
  }, [searchTerm, news]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/v1/public/news/published");
      const newsData = response.data?.news || response.news || [];
      setNews(newsData);
      setFilteredNews(newsData);
    } catch (error) {
      console.error("Failed to fetch news:", error);
      setNews([]);
      setFilteredNews([]);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (article) => {
    if (article.featuredImage) {
      return article.featuredImage;
    }
    // Fallback to Unsplash placeholder
    return `https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80`;
  };

  if (loading) {
    return <PageLoading text="Loading news articles..." />;
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold font-display mb-6">
            Latest <span className="neon-text">News</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Stay informed with the latest updates and announcements from HUEACC
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <Input
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={Search}
            />
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.map((article, index) => (
                <Link
                  key={article.id || index}
                  to={`/news/${article.slug}`}
                  className="glass-card hover-lift group cursor-pointer block"
                >
                  {/* Image */}
                  <div className="aspect-video rounded-lg overflow-hidden mb-4">
                    <img
                      src={getImageUrl(article)}
                      alt={article.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80";
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatRelativeTime(
                        article.publishDate || article.createdAt
                      )}
                    </div>

                    <h3 className="text-lg font-semibold group-hover:text-neon-green transition-colors line-clamp-2">
                      {article.title || `News Article ${index + 1}`}
                    </h3>

                    {article.excerpt && (
                      <p className="text-muted-foreground text-sm line-clamp-3">
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
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-neon-green group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">
                {searchTerm
                  ? "No news articles found matching your search."
                  : "No news articles available at this time."}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default NewsListingPage;
