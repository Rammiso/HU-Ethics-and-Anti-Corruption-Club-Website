import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  pageVariants,
  fadeUp,
  staggerContainer,
  heroTextReveal,
  glowButton,
  holographicCard,
  cardSweep,
} from "../../utils/motionVariants";

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
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Futuristic Background Image */}
        <div className="absolute inset-0 z-0 select-none">
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img
              src="/images/hero-bg.png"
              alt="Futuristic Background"
              className="w-full h-full object-cover opacity-80"
            />
          </motion.div>

          {/* Futuristic Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/50 to-background/95 mix-blend-multiply" />
          <motion.div
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 via-transparent to-neon-green/20 mix-blend-overlay"
          />
          <div className="absolute inset-0 backdrop-blur-[1px]" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-4xl mx-auto"
          >
            <motion.div
              variants={fadeUp}
              className="inline-block mb-6 px-4 py-1.5 rounded-full border border-neon-green/30 bg-neon-green/5 backdrop-blur-md"
            >
              <span className="text-xs md:text-sm font-medium tracking-wider text-neon-green uppercase flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green"></span>
                </span>
                Official Platform for HUEACC
              </span>
            </motion.div>

            <motion.h1
              variants={heroTextReveal}
              className="text-4xl md:text-6xl lg:text-7xl font-bold font-display mb-8 leading-tight text-balance tracking-tight"
            >
              Safeguarding{" "}
              <span className="neon-text relative inline-block">
                Ethics
                <motion.span
                  className="absolute -inset-1 bg-neon-green/20 blur-xl"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </span>{" "}
              <br />
              Eliminating{" "}
              <span className="neon-text relative inline-block">
                Corruption
                <motion.span
                  className="absolute -inset-1 bg-red-500/20 blur-xl"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                />
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-foreground/80 font-light mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Haramaya University's premier digital hub for transparency and
              accountability. Reporting corruption is the first step toward a
              cleaner future.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link to="/report">
                <motion.div
                  variants={glowButton}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className="btn-primary px-8 py-4 text-lg rounded-xl flex items-center gap-3 w-full sm:w-auto shadow-neon"
                >
                  <FileText className="w-5 h-5" />
                  Report Corruption
                </motion.div>
              </Link>

              <Link to="#news">
                <motion.div
                  variants={glowButton}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className="px-8 py-4 text-lg rounded-xl flex items-center gap-3 w-full sm:w-auto bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  <Clock className="w-5 h-5" />
                  Latest News
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Scifi Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5, y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-px h-16 bg-gradient-to-b from-neon-green/0 via-neon-green to-neon-green/0" />
          <div className="text-[10px] text-neon-green/50 text-center mt-2 tracking-[0.2em] font-mono">
            SCROLL
          </div>
        </motion.div>
      </section>

      {/* News Section */}
      <section id="news" className="py-24 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-neon-blue/5 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="flex items-center justify-between mb-12"
          >
            <motion.div variants={fadeUp}>
              <h3 className="text-3xl md:text-4xl font-bold font-display mb-2 flex items-center gap-3">
                <span className="w-2 h-8 bg-neon-green rounded-full" />
                Latest News
              </h3>
              <p className="text-muted-foreground max-w-md ml-5">
                Stay updated with our latest announcements and activities
              </p>
            </motion.div>
            {newsData.length > 0 && (
              <motion.div variants={fadeUp}>
                <Link to="/news">
                  <motion.button
                    whileHover={{ x: 5, color: "#39ff14" }}
                    className="text-foreground hover:text-neon-green transition-colors flex items-center gap-2 font-medium"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </motion.div>

          {newsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card animate-pulse h-[340px]">
                  <div className="h-48 bg-muted/50 rounded-lg mb-4" />
                  <div className="h-4 bg-muted/50 rounded mb-2 w-3/4" />
                  <div className="h-4 bg-muted/50 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : newsData.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {newsData.map((article, index) => (
                <motion.article key={article.id || index} variants={fadeUp}>
                  <Link to={`/news/${article.slug || article.id}`}>
                    <motion.div
                      variants={holographicCard}
                      initial="rest"
                      whileHover="hover"
                      className="glass-card h-full overflow-hidden group relative border border-white/5 bg-black/40 backdrop-blur-xl"
                    >
                      {/* Holographic Sweep Effect */}
                      <motion.div
                        variants={cardSweep}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 z-0 pointer-events-none"
                      />

                      {article.featuredImage && (
                        <div className="aspect-video rounded-lg overflow-hidden mb-5 relative z-10">
                          <motion.img
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.4 }}
                            src={article.featuredImage}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                          {/* Image Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                        </div>
                      )}

                      <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-2 text-xs text-neon-green/80 font-mono uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(
                            article.publishDate || article.createdAt
                          )}
                        </div>

                        <h4 className="text-xl font-bold leading-tight group-hover:text-neon-green transition-colors line-clamp-2">
                          {article.title || `News Article ${index + 1}`}
                        </h4>

                        {article.excerpt && (
                          <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                            {truncateText(article.excerpt, 120)}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/5">
                          <span className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon-green/50"></span>
                            {article.author?.name || "HUEACC"}
                          </span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-neon-green transition-colors" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
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
      <section id="events" className="py-24 bg-muted/20 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="flex items-center justify-between mb-12"
          >
            <motion.div variants={fadeUp}>
              <h3 className="text-3xl md:text-4xl font-bold font-display mb-2 flex items-center gap-3">
                <span className="w-2 h-8 bg-neon-blue rounded-full" />
                Upcoming Events
              </h3>
              <p className="text-muted-foreground max-w-md ml-5">
                Join us in our upcoming activities and workshops
              </p>
            </motion.div>
            {eventsData.length > 0 && (
              <motion.div variants={fadeUp}>
                <Link to="/events">
                  <motion.button
                    whileHover={{ x: 5, color: "#00f0ff" }} // Neon Blue
                    className="text-foreground hover:text-neon-blue transition-colors flex items-center gap-2 font-medium"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </motion.div>

          {eventsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card animate-pulse h-[300px]">
                  <div className="h-32 bg-muted/50 rounded-lg mb-4" />
                  <div className="h-4 bg-muted/50 rounded mb-2 w-3/4" />
                  <div className="h-4 bg-muted/50 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : eventsData.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {eventsData.map((event, index) => (
                <motion.article key={event.id || index} variants={fadeUp}>
                  <Link to={`/events/${event.slug || event.id}`}>
                    <motion.div
                      variants={holographicCard}
                      initial="rest"
                      whileHover="hover"
                      className="glass-card h-full group relative overflow-hidden border border-white/5 bg-black/40 backdrop-blur-xl"
                      style={{
                        "--hover-color": "rgba(0, 240, 255, 0.15)", // Neon Blue for events
                      }}
                    >
                      {/* Holographic Sweep Effect (Blue Tint) */}
                      <motion.div
                        variants={cardSweep}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent skew-x-12 z-0 pointer-events-none"
                      />

                      {event.featuredImage && (
                        <div className="aspect-video rounded-lg overflow-hidden mb-4 relative z-10">
                          <motion.img
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.4 }}
                            src={event.featuredImage}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                        </div>
                      )}

                      <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-4 text-xs text-neon-blue/80 font-mono uppercase tracking-wider">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(event.startDate)}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {truncateText(event.location, 15)}
                            </div>
                          )}
                        </div>

                        <h4 className="text-xl font-bold leading-tight group-hover:text-neon-blue transition-colors">
                          {event.title || `Event ${index + 1}`}
                        </h4>

                        {event.description && (
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {truncateText(event.description, 100)}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-sm">
                            {event.capacity
                              ? `${event.capacity} seats`
                              : "Open event"}
                          </span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-neon-blue transition-colors" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
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
    </motion.div>
  );
};

export default HomePage;
