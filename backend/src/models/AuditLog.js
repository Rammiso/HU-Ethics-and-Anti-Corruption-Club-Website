// AuditLog model
// Defines audit log data structure

export class AuditLog {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.action = data.action;
    this.entityType = data.entity_type;
    this.entityId = data.entity_id;
    this.details = data.details;
    this.ipAddress = data.ip_address;
    this.createdAt = data.created_at;
  }
}
