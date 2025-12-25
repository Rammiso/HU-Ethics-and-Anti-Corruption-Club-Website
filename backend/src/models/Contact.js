// Contact model
// Defines contact message data structure

export class Contact {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.subject = data.subject;
    this.message = data.message;
    this.status = data.status;
    this.repliedBy = data.replied_by;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }
}
