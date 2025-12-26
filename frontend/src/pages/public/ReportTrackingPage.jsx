import React, { useState } from "react";
import {
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { apiClient } from "../../services/api";
import { useNotification } from "../../hooks/useNotification";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { formatDate } from "../../utils/helpers";

const ReportTrackingPage = () => {
  const [trackingId, setTrackingId] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { error: errorNotif } = useNotification();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      errorNotif("Error", "Please enter a tracking ID");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await apiClient.get(
        `/v1/public/reports/track/${trackingId}`
      );
      setReport(response.data?.report || response.report || response.data);
    } catch (error) {
      console.error("Failed to track report:", error);
      setReport(null);
      errorNotif("Error", error.response?.data?.message || "Report not found");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "submitted":
      case "pending":
        return <Clock className="w-8 h-8 text-yellow-400" />;
      case "under_review":
      case "investigating":
        return <AlertCircle className="w-8 h-8 text-blue-400" />;
      case "resolved":
      case "completed":
        return <CheckCircle2 className="w-8 h-8 text-neon-green" />;
      case "rejected":
      case "closed":
        return <XCircle className="w-8 h-8 text-red-400" />;
      default:
        return <Clock className="w-8 h-8 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "submitted":
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "under_review":
      case "investigating":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "resolved":
      case "completed":
        return "bg-green-500/20 text-neon-green border-green-500/30";
      case "rejected":
      case "closed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

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
            Track Your <span className="neon-text">Report</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Check the status of your submitted report using your tracking ID
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="glass-card">
              <Input
                label="Tracking ID"
                placeholder="Enter your tracking ID"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                leftIcon={Search}
                helperText="The tracking ID was provided when you submitted your report"
              />
              <div className="mt-6">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  leftIcon={Search}
                >
                  {loading ? "Searching..." : "Track Report"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Report Status Display */}
      {searched && report && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Status Card */}
              <div className="glass-card text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center">
                  {getStatusIcon(report.status)}
                </div>

                <h2 className="text-2xl font-bold font-display mb-2">
                  Report Status
                </h2>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                    report.status
                  )}`}
                >
                  {report.status?.replace("_", " ").toUpperCase() || "PENDING"}
                </span>
              </div>

              {/* Report Details */}
              <div className="glass-card">
                <h3 className="text-lg font-semibold mb-4">Report Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-muted-foreground">Tracking ID:</span>
                    <span className="font-mono font-semibold">
                      {report.trackingId}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-muted-foreground">Submitted:</span>
                    <span className="font-semibold">
                      {formatDate(report.createdAt || report.submittedAt)}
                    </span>
                  </div>

                  {report.category && (
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-semibold">
                        {report.category.name || report.category}
                      </span>
                    </div>
                  )}

                  {report.lastUpdated && (
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">
                        Last Updated:
                      </span>
                      <span className="font-semibold">
                        {formatDate(report.lastUpdated)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Timeline (if available) */}
              {report.statusHistory && report.statusHistory.length > 0 && (
                <div className="glass-card">
                  <h3 className="text-lg font-semibold mb-4">Status History</h3>
                  <div className="space-y-4">
                    {report.statusHistory.map((history, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-neon-green"></div>
                          {index < report.statusHistory.length - 1 && (
                            <div className="w-0.5 h-full bg-neon-green/30 my-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-semibold">
                            {history.status?.replace("_", " ").toUpperCase()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(history.timestamp)}
                          </p>
                          {history.note && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {history.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy Notice */}
              <div className="glass-card border-l-4 border-neon-blue">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-neon-blue flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Privacy Notice</h3>
                    <p className="text-sm text-muted-foreground">
                      Only status information is displayed to protect your
                      anonymity. For security reasons, report details are not
                      shown here.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Not Found Message */}
      {searched && !report && !loading && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="glass-card">
                <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                <h3 className="text-xl font-semibold mb-2">Report Not Found</h3>
                <p className="text-muted-foreground mb-6">
                  No report was found with that tracking ID. Please check the ID
                  and try again.
                </p>
                <Button onClick={() => setSearched(false)}>Try Again</Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ReportTrackingPage;
