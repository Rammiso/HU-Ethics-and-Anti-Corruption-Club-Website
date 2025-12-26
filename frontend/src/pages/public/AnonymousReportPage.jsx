import React, { useState, useEffect } from "react";
import { Shield, AlertCircle, CheckCircle2, Upload } from "lucide-react";
import { apiClient } from "../../services/api";
import { useNotification } from "../../hooks/useNotification";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import FileUpload from "../../components/ui/FileUpload";

const AnonymousReportPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const { success: successNotif, error: errorNotif } = useNotification();

  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    location: "",
    incidentDate: "",
    evidence: [],
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get("/v1/public/report-categories");
      const categoriesData =
        response.data?.categories || response.categories || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      errorNotif("Error", "Failed to load report categories");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (files) => {
    setFormData((prev) => ({ ...prev, evidence: files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("category", formData.category);
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      if (formData.location) submitData.append("location", formData.location);
      if (formData.incidentDate)
        submitData.append("incidentDate", formData.incidentDate);

      // Append files if any
      formData.evidence.forEach((file) => {
        submitData.append("evidence", file);
      });

      const response = await apiClient.post("/v1/public/reports", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const reportTrackingId = response.data?.trackingId || response.trackingId;
      setTrackingId(reportTrackingId);
      setSuccess(true);
      successNotif("Success", "Report submitted successfully");

      // Reset form
      setFormData({
        category: "",
        title: "",
        description: "",
        location: "",
        incidentDate: "",
        evidence: [],
      });
    } catch (error) {
      console.error("Failed to submit report:", error);
      errorNotif(
        "Error",
        error.response?.data?.message || "Failed to submit report"
      );
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    { value: "", label: "Select a category" },
    ...categories.map((cat) => ({
      value: cat.id || cat._id,
      label: cat.name,
    })),
  ];

  if (success && trackingId) {
    return (
      <div>
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-neon-green to-green-400 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-3xl md:text-4xl font-bold font-display mb-4">
                Report Submitted Successfully
              </h1>

              <p className="text-muted-foreground mb-8">
                Thank you for reporting. Your report has been received and will
                be reviewed by our team.
              </p>

              <div className="glass-card mb-8">
                <h2 className="text-lg font-semibold mb-2">Your Tracking ID</h2>
                <div className="bg-background/50 py-4 px-6 rounded-lg">
                  <p className="text-2xl font-mono font-bold neon-text">
                    {trackingId}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Save this ID to track your report status. You will not be able
                  to retrieve it later.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/report/track" className="btn-primary">
                  Track This Report
                </a>
                <button
                  onClick={() => setSuccess(false)}
                  className="btn-secondary"
                >
                  Submit Another Report
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
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
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center shadow-neon-sm">
            <Shield className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold font-display mb-6">
            Submit Anonymous <span className="neon-text">Report</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your identity is completely protected. Report corruption or ethical
            violations confidentially.
          </p>
        </div>
      </section>

      {/* Privacy Notice */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="glass-card border-l-4 border-neon-green">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-neon-green flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">
                    Privacy & Anonymity Guaranteed
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• No personal information is collected or stored</li>
                    <li>• Your IP address is not logged</li>
                    <li>• Reports are encrypted and handled confidentially</li>
                    <li>
                      • You'll receive a tracking ID to follow up anonymously
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Report Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div className="glass-card">
                <Select
                  label="Report Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  options={categoryOptions}
                  required
                  helperText="Select the type of violation you're reporting"
                />
              </div>

              {/* Title */}
              <div className="glass-card">
                <Input
                  label="Report Title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Brief summary of the incident"
                />
              </div>

              {/* Description */}
              <div className="glass-card">
                <Textarea
                  label="Detailed Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Provide as much detail as possible about the incident..."
                  rows={8}
                  helperText="Include what happened, when, who was involved, and any relevant context"
                />
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card">
                  <Input
                    label="Location (Optional)"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Where did this occur?"
                  />
                </div>

                <div className="glass-card">
                  <Input
                    label="Incident Date (Optional)"
                    name="incidentDate"
                    type="date"
                    value={formData.incidentDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Evidence Upload */}
              <div className="glass-card">
                <FileUpload
                  label="Evidence (Optional)"
                  accept="image/*,application/pdf,.doc,.docx"
                  multiple
                  maxSize={10}
                  onFilesSelected={handleFileChange}
                  helperText="You can upload images, documents, or PDFs (max 10MB per file)"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-center pt-4">
                <Button
                  type="submit"
                  className="w-full md:w-auto min-w-[200px]"
                  disabled={loading}
                  leftIcon={Upload}
                >
                  {loading ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnonymousReportPage;
