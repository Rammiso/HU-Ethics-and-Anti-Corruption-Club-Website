import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  X,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { apiClient } from "../../services/api";
import { formatDate } from "../../utils/helpers";
import { PageLoading } from "../../components/common/Loading";

const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNews, setCurrentNews] = useState(null); // null for create, object for edit
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    tags: "",
    status: "DRAFT",
  });
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/news");
      setNews(response.data?.news || []);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (newsItem = null) => {
    if (newsItem) {
      setCurrentNews(newsItem);
      setFormData({
        title: newsItem.title,
        excerpt: newsItem.excerpt || "",
        content: newsItem.content,
        featuredImage: newsItem.featuredImage || "",
        tags: newsItem.tags?.join(", ") || "",
        status: newsItem.status,
      });
    } else {
      setCurrentNews(null);
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        featuredImage: "",
        tags: "",
        status: "DRAFT",
      });
    }
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentNews(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    try {
      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      };

      if (currentNews) {
        await apiClient.put(
          `/admin/news/${currentNews.id || currentNews._id}`,
          payload
        );
        setSuccessMessage("News updated successfully!");
      } else {
        await apiClient.post("/admin/news", payload);
        setSuccessMessage("News created successfully!");
      }

      fetchNews();
      handleCloseModal();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save news:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      console.error("Error status:", error.status);

      // Log validation details if available
      if (error.response?.data?.error?.details) {
        console.error("Validation errors:", error.response.data.error.details);
        error.response.data.error.details.forEach((detail, index) => {
          console.error(`Validation error ${index + 1}:`, detail);
        });
      }

      setFormError(
        error.response?.data?.message ||
          error.message ||
          "Failed to save news. Please try again."
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news article?"))
      return;

    try {
      await apiClient.delete(`/admin/news/${id}`);
      setSuccessMessage("News deleted successfully!");
      fetchNews();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to delete news:", error);
      alert("Failed to delete news article.");
    }
  };

  const handleToggleStatus = async (article) => {
    const newStatus = article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const action = newStatus === "PUBLISHED" ? "publish" : "unpublish";
      await apiClient.put(`/admin/news/${article.id || article._id}/${action}`);

      // Optimistically update local state
      setNews(
        news.map((n) =>
          n.id === article.id || n._id === article._id
            ? { ...n, status: newStatus }
            : n
        )
      );

      setSuccessMessage(`News ${action}ed successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error(`Failed to update status:`, error);
      alert(`Failed to update status.`);
    }
  };

  const filteredNews = news.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">News Management</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage news articles
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create News
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* News List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-4">Article</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredNews.length > 0 ? (
                filteredNews.map((item) => (
                  <tr
                    key={item.id || item._id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.featuredImage ? (
                          <img
                            src={item.featuredImage}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {item.excerpt || "No excerpt"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === "PUBLISHED"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}
                      >
                        {item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-muted-foreground">
                        {item.author?.name || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(item.updatedAt || item.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          title={
                            item.status === "PUBLISHED"
                              ? "Unpublish"
                              : "Publish"
                          }
                          onClick={() => handleToggleStatus(item)}
                          className={`p-2 rounded-lg hover:bg-accent transition-colors ${
                            item.status === "PUBLISHED"
                              ? "text-green-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {item.status === "PUBLISHED" ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          title="Edit"
                          onClick={() => handleOpenModal(item)}
                          className="p-2 rounded-lg hover:bg-accent text-blue-500 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => handleDelete(item.id || item._id)}
                          className="p-2 rounded-lg hover:bg-accent text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No news articles found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border border-border">
              <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
                <h2 className="text-xl font-bold">
                  {currentNews ? "Edit News Article" : "Create News Article"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {formError && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                    {formError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Enter article title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Excerpt (Short Summary)
                    </label>
                    <textarea
                      rows="2"
                      value={formData.excerpt}
                      onChange={(e) =>
                        setFormData({ ...formData, excerpt: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Brief summary used in cards"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Content
                    </label>
                    <textarea
                      required
                      rows="8"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                      placeholder="Article content (Markdown supported)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Featured Image URL
                      </label>
                      <input
                        type="url"
                        value={formData.featuredImage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            featuredImage: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) =>
                          setFormData({ ...formData, tags: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="ethics, campus, update"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="DRAFT"
                          checked={formData.status === "DRAFT"}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                          }
                          className="text-primary focus:ring-primary"
                        />
                        Draft
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="PUBLISHED"
                          checked={formData.status === "PUBLISHED"}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                          }
                          className="text-primary focus:ring-primary"
                        />
                        Published
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {currentNews ? "Save Changes" : "Create News"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default NewsManagement;
