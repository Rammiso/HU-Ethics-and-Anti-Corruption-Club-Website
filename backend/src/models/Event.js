// Event model
// Defines event data structure

export class Event {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.eventDate = data.event_date;
    this.location = data.location;
    this.status = data.status;
    this.createdBy = data.created_by;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }
}
