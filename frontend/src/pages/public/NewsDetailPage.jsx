import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Clock, User, ArrowLeft, Tag } from "lucide-react";
import { apiClient } from "../../services/api";
import { PageLoading } from "../../components/common/Loading";
import { formatDate } from "../../utils/helpers";

const NewsDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/v1/public/news/slug/${slug}`);
      setArticle(response.data?.news || response.news || response.data);
    } catch (error) {
      console.error("Failed to fetch article:", error);
      setError("Article not found");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = () => {
    if (article?.featuredImage) {
      return article.featuredImage;
    }
    return `https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80`;
  };

  if (loading) {
    return <PageLoading text="Loading article..." />;
  }

  if (error || !article) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/news" className="btn-primary">
            Back to News
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <section className="py-6 border-b border-white/10">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-neon-green transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </section>

      {/* Article Header */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
              {article.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{article.author?.name || "HUEACC"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {formatDate(article.publishDate || article.createdAt)}
                </span>
              </div>
            </div>

            {/* Featured Image */}
            {article.featuredImage && (
              <div className="aspect-video rounded-2xl overflow-hidden mb-8">
                <img
                  src={getImageUrl()}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80";
                  }}
                />
              </div>
            )}

            {article.excerpt && (
              <div className="glass-card mb-8">
                <p className="text-lg leading-relaxed">{article.excerpt}</p>
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-invert prose-lg max-w-none">
              <div
                className="text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: article.content || article.body,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Back to News CTA */}
      <section className="py-12 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Link
              to="/news"
              className="btn-secondary inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              View More News
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsDetailPage;
