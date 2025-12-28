import mongoose from "mongoose";

// News status enum
export const NEWS_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
};

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "News title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
      minlength: [5, "Title must be at least 5 characters"],
    },

    content: {
      type: String,
      required: [true, "News content is required"],
      trim: true,
      maxlength: [10000, "Content cannot exceed 10000 characters"],
      minlength: [20, "Content must be at least 20 characters"],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Author is required"],
    },

    status: {
      type: String,
      enum: {
        values: Object.values(NEWS_STATUS),
        message: "Status must be either DRAFT or PUBLISHED",
      },
      default: NEWS_STATUS.DRAFT,
      required: true,
    },

    publishDate: {
      type: Date,
      required: function () {
        return this.status === NEWS_STATUS.PUBLISHED;
      },
      validate: {
        validator: function (date) {
          // Publish date cannot be in the future for published articles
          if (this.status === NEWS_STATUS.PUBLISHED && date) {
            return date <= new Date();
          }
          return true;
        },
        message: "Publish date cannot be in the future",
      },
    },

    // SEO and metadata
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase letters, numbers, and hyphens",
      ],
    },

    excerpt: {
      type: String,
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
      trim: true,
    },

    tags: [
      {
        type: String,
        maxlength: [50, "Tag cannot exceed 50 characters"],
        trim: true,
      },
    ],

    // Featured image (optional)
    featuredImage: {
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      uploadedAt: Date,
    },

    // View count for analytics
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Priority for ordering
    priority: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    // Last updated by (for audit trail)
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for performance
newsSchema.index({ status: 1, publishDate: -1 });
newsSchema.index({ author: 1, status: 1 });
newsSchema.index({ tags: 1 });
newsSchema.index({ createdAt: -1 });
newsSchema.index({ publishDate: -1 });

// Compound indexes for common queries
newsSchema.index({ status: 1, priority: -1, publishDate: -1 });

// Pre-save middleware to generate slug and set publish date
newsSchema.pre("save", function (next) {
  // Generate slug from title if not provided
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();
  }

  // Set publish date when status changes to PUBLISHED
  if (
    this.isModified("status") &&
    this.status === NEWS_STATUS.PUBLISHED &&
    !this.publishDate
  ) {
    this.publishDate = new Date();
  }

  // Generate excerpt from content if not provided
  if (this.isModified("content") && !this.excerpt) {
    this.excerpt =
      this.content
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .substring(0, 200) + "...";
  }

  next();
});

// Static method to get published news
newsSchema.statics.getPublishedNews = function (options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = "publishDate",
    sortOrder = "desc",
    tags,
    search,
  } = options;

  let query = { status: NEWS_STATUS.PUBLISHED };

  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } },
    ];
  }

  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  return this.find(query)
    .populate("author", "name email")
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select("-lastUpdatedBy");
};

// Static method to get news by slug (published only)
newsSchema.statics.getBySlug = function (slug) {
  return this.findOne({ slug, status: NEWS_STATUS.PUBLISHED })
    .populate("author", "name email")
    .select("-lastUpdatedBy");
};

// Static method for admin to get all news with filters
newsSchema.statics.getNewsForAdmin = function (filters = {}, options = {}) {
  const { status, author, startDate, endDate, search, tags } = filters;

  const {
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  let query = {};

  if (status) query.status = status;
  if (author) query.author = author;
  if (tags && tags.length > 0) query.tags = { $in: tags };

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } },
    ];
  }

  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  return this.find(query)
    .populate("author", "name email")
    .populate("lastUpdatedBy", "name email")
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Instance method to increment view count
newsSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  return this.save();
};

// Instance method to publish news
newsSchema.methods.publish = function (publishedBy) {
  this.status = NEWS_STATUS.PUBLISHED;
  this.publishDate = new Date();
  this.lastUpdatedBy = publishedBy;
  return this;
};

// Instance method to unpublish news
newsSchema.methods.unpublish = function (unpublishedBy) {
  this.status = NEWS_STATUS.DRAFT;
  this.publishDate = null;
  this.lastUpdatedBy = unpublishedBy;
  return this;
};

// Virtual for public data (excludes sensitive admin information)
newsSchema.virtual("publicData").get(function () {
  return {
    _id: this._id,
    title: this.title,
    content: this.content,
    author: this.author,
    status: this.status,
    publishDate: this.publishDate,
    slug: this.slug,
    excerpt: this.excerpt,
    tags: this.tags,
    featuredImage: this.featuredImage,
    viewCount: this.viewCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
});

const News = mongoose.model("News", newsSchema);

export default News;
