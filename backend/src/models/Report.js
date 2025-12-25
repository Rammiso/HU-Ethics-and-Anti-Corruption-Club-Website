// Report model
// Defines report data structure

export class Report {
  constructor(data) {
    this.id = data.id;
    this.trackingId = data.tracking_id;
    this.category = data.category;
    this.severity = data.severity;
    this.description = data.description;
    this.incidentDate = data.incident_date;
    this.location = data.location;
    this.status = data.status;
    this.assignedTo = data.assigned_to;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }
}
