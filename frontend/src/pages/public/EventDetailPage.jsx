import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, Users, ArrowLeft } from "lucide-react";
import { apiClient } from "../../services/api";
import { PageLoading } from "../../components/common/Loading";
import { formatDate } from "../../utils/helpers";

const EventDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvent();
  }, [slug]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/v1/public/events/slug/${slug}`);
      setEvent(response.data?.event || response.event || response.data);
    } catch (error) {
      console.error("Failed to fetch event:", error);
      setError("Event not found");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = () => {
    if (event?.featuredImage) {
      return event.featuredImage;
    }
    return `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80`;
  };

  if (loading) {
    return <PageLoading text="Loading event..." />;
  }

  if (error || !event) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/events" className="btn-primary">
            Back to Events
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
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-neon-blue transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </section>

      {/* Event Header */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Event Type Badge */}
            {event.eventType && (
              <span className="inline-block px-3 py-1 text-xs rounded-full bg-accent text-accent-foreground mb-6">
                {event.eventType.replace("_", " ")}
              </span>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
              {event.title}
            </h1>

            {/* Meta Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="glass-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-blue to-blue-400 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm font-semibold">
                      {formatDate(event.startDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="text-sm font-semibold">
                      {event.startTime || "TBA"}
                    </p>
                  </div>
                </div>
              </div>

              {event.location && (
                <div className="glass-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-semibold">{event.location}</p>
                    </div>
                  </div>
                </div>
              )}

              {event.capacity && (
                <div className="glass-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-green to-green-400 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Capacity</p>
                      <p className="text-sm font-semibold">
                        {event.capacity} seats
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Featured Image */}
            {event.featuredImage && (
              <div className="aspect-video rounded-2xl overflow-hidden mb-8">
                <img
                  src={getImageUrl()}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80";
                  }}
                />
              </div>
            )}

            {/* Event Description */}
            <div className="prose prose-invert prose-lg max-w-none">
              <div className="glass-card">
                <h2 className="text-2xl font-bold font-display mb-4">
                  About This Event
                </h2>
                <div
                  className="text-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: event.description || event.body,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Events CTA */}
      <section className="py-12 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Link
              to="/events"
              className="btn-secondary inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              View More Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventDetailPage;
