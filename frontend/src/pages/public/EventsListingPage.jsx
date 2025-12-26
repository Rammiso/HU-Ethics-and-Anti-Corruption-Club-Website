import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, ArrowRight, Search } from "lucide-react";
import { apiClient } from "../../services/api";
import { PageLoading } from "../../components/common/Loading";
import { formatDate, truncateText } from "../../utils/helpers";
import Input from "../../components/ui/Input";

const EventsListingPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = events.filter(
        (event) =>
          event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [searchTerm, events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/v1/public/events/upcoming");
      const eventsData = response.data?.events || response.events || [];
      setEvents(eventsData);
      setFilteredEvents(eventsData);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (event) => {
    if (event.featuredImage) {
      return event.featuredImage;
    }
    // Fallback to Unsplash placeholder for events
    return `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80`;
  };

  if (loading) {
    return <PageLoading text="Loading events..." />;
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold font-display mb-6">
            Upcoming <span className="neon-text">Events</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Join us for engaging workshops, seminars, and activities
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={Search}
            />
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => (
                <Link
                  key={event.id || index}
                  to={`/events/${event.slug}`}
                  className="glass-card hover-lift group cursor-pointer block"
                >
                  {/* Image */}
                  <div className="aspect-video rounded-lg overflow-hidden mb-4">
                    <img
                      src={getImageUrl(event)}
                      alt={event.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80";
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    {/* Event Type Badge */}
                    {event.eventType && (
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-accent text-accent-foreground">
                        {event.eventType.replace("_", " ")}
                      </span>
                    )}

                    {/* Date & Location */}
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

                    {/* Title */}
                    <h3 className="text-lg font-semibold group-hover:text-neon-blue transition-colors line-clamp-2">
                      {event.title || `Event ${index + 1}`}
                    </h3>

                    {/* Description */}
                    {event.description && (
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {truncateText(event.description, 120)}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">
                        {event.capacity
                          ? `${event.capacity} seats`
                          : "Open event"}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-neon-blue group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg text-muted-foreground">
                {searchTerm
                  ? "No events found matching your search."
                  : "No upcoming events at this time. Check back soon!"}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EventsListingPage;
