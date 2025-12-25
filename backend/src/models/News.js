// News model
// Defines news article data structure

export class News {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.content = data.content;
    this.excerpt = data.excerpt;
    this.category = data.category;
    this.status = data.status;
    this.publishedAt = data.published_at;
    this.createdBy = data.created_by;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }
}
