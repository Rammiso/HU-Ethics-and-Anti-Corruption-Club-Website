import mongoose from "mongoose";

// Event status enum
export const EVENT_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
};

// Event type enum
export const EVENT_TYPE = {
  WORKSHOP: "WORKSHOP",
  SEMINAR: "SEMINAR",
  CONFERENCE: "CONFERENCE",
  MEETING: "MEETING",
  TRAINING: "TRAINING",
  OTHER: "OTHER",
};

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
      minlength: [5, "Title must be at least 5 characters"],
    },

    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
      minlength: [20, "Description must be at least 20 characters"],
    },

    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
      minlength: [3, "Location must be at least 3 characters"],
    },

    startDate: {
      type: Date,
      required: [true, "Event start date is required"],
      validate: {
        validator: function (date) {
          // Start date should be in the future for new events
          if (this.isNew) {
            return date > new Date();
          }
          return true;
        },
        message: "Event start date should be in the future",
      },
    },

    endDate: {
      type: Date,
      required: [true, "Event end date is required"],
      validate: {
        validator: function (date) {
          // End date should be after start date
          return !this.startDate || date >= this.startDate;
        },
        message: "Event end date must be after start date",
      },
    },

    capacity: {
      type: Number,
      min: [1, "Capacity must be at least 1"],
      max: [10000, "Capacity cannot exceed 10000"],
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: Object.values(EVENT_STATUS),
        message: "Status must be either DRAFT or PUBLISHED",
      },
      default: EVENT_STATUS.DRAFT,
      required: true,
    },

    eventType: {
      type: String,
      enum: {
        values: Object.values(EVENT_TYPE),
        message: "Invalid event type",
      },
      default: EVENT_TYPE.OTHER,
      required: true,
    },

    // Event organizer/author
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Event organizer is required"],
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

    // Registration information
    registrationRequired: {
      type: Boolean,
      default: false,
    },

    registrationDeadline: {
      type: Date,
      validate: {
        validator: function (date) {
          // Registration deadline should be before event start date
          return !date || !this.startDate || date <= this.startDate;
        },
        message: "Registration deadline must be before event start date",
      },
    },

    registrationLink: {
      type: String,
      maxlength: [500, "Registration link cannot exceed 500 characters"],
      validate: {
        validator: function (url) {
          if (!url) return true;
          const urlRegex = /^https?:\/\/.+/;
          return urlRegex.test(url);
        },
        message: "Registration link must be a valid URL",
      },
    },

    // Contact information
    contactEmail: {
      type: String,
      maxlength: [100, "Contact email cannot exceed 100 characters"],
      validate: {
        validator: function (email) {
          if (!email) return true;
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        },
        message: "Contact email must be valid",
      },
    },

    contactPhone: {
      type: String,
      maxlength: [20, "Contact phone cannot exceed 20 characters"],
    },

    // Additional details
    requirements: {
      type: String,
      maxlength: [1000, "Requirements cannot exceed 1000 characters"],
    },

    agenda: [
      {
        time: {
          type: String,
          required: true,
          maxlength: [20, "Time cannot exceed 20 characters"],
        },
        activity: {
          type: String,
          required: true,
          maxlength: [200, "Activity cannot exceed 200 characters"],
        },
        speaker: {
          type: String,
          maxlength: [100, "Speaker name cannot exceed 100 characters"],
        },
      },
    ],

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
eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ organizer: 1, status: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ eventType: 1, status: 1 });
eventSchema.index({ startDate: 1, endDate: 1 });

// Compound indexes for common queries
eventSchema.index({ status: 1, priority: -1, startDate: 1 });
eventSchema.index({ status: 1, eventType: 1, startDate: 1 });

// Pre-save middleware to generate slug
eventSchema.pre("save", function (next) {
  // Generate slug from title if not provided
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();
  }

  next();
});

// Static method to get published upcoming events
eventSchema.statics.getUpcomingEvents = function (options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = "startDate",
    sortOrder = "asc",
    eventType,
    tags,
    search,
  } = options;

  let query = {
    status: EVENT_STATUS.PUBLISHED,
    startDate: { $gte: new Date() }, // Only upcoming events
  };

  if (eventType) query.eventType = eventType;
  if (tags && tags.length > 0) query.tags = { $in: tags };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }

  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  return this.find(query)
    .populate("organizer", "name email")
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select("-lastUpdatedBy");
};

// Static method to get published past events
eventSchema.statics.getPastEvents = function (options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = "startDate",
    sortOrder = "desc",
    eventType,
    tags,
    search,
  } = options;

  let query = {
    status: EVENT_STATUS.PUBLISHED,
    endDate: { $lt: new Date() }, // Only past events
  };

  if (eventType) query.eventType = eventType;
  if (tags && tags.length > 0) query.tags = { $in: tags };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }

  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  return this.find(query)
    .populate("organizer", "name email")
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select("-lastUpdatedBy");
};

// Static method to get event by slug (published only)
eventSchema.statics.getBySlug = function (slug) {
  return this.findOne({ slug, status: EVENT_STATUS.PUBLISHED })
    .populate("organizer", "name email")
    .select("-lastUpdatedBy");
};

// Static method for admin to get all events with filters
eventSchema.statics.getEventsForAdmin = function (filters = {}, options = {}) {
  const { status, organizer, eventType, startDate, endDate, search, tags } =
    filters;

  const {
    page = 1,
    limit = 20,
    sortBy = "startDate",
    sortOrder = "asc",
  } = options;

  let query = {};

  if (status) query.status = status;
  if (organizer) query.organizer = organizer;
  if (eventType) query.eventType = eventType;
  if (tags && tags.length > 0) query.tags = { $in: tags };

  if (startDate || endDate) {
    query.startDate = {};
    if (startDate) query.startDate.$gte = new Date(startDate);
    if (endDate) query.startDate.$lte = new Date(endDate);
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }

  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  return this.find(query)
    .populate("organizer", "name email")
    .populate("lastUpdatedBy", "name email")
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Instance method to increment view count
eventSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  return this.save();
};

// Instance method to publish event
eventSchema.methods.publish = function (publishedBy) {
  this.status = EVENT_STATUS.PUBLISHED;
  this.lastUpdatedBy = publishedBy;
  return this;
};

// Instance method to unpublish event
eventSchema.methods.unpublish = function (unpublishedBy) {
  this.status = EVENT_STATUS.DRAFT;
  this.lastUpdatedBy = unpublishedBy;
  return this;
};

// Instance method to check if event is upcoming
eventSchema.methods.isUpcoming = function () {
  return this.startDate > new Date();
};

// Instance method to check if event is ongoing
eventSchema.methods.isOngoing = function () {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now;
};

// Instance method to check if event is past
eventSchema.methods.isPast = function () {
  return this.endDate < new Date();
};

// Virtual for public data (excludes sensitive admin information)
eventSchema.virtual("publicData").get(function () {
  return {
    _id: this._id,
    title: this.title,
    description: this.description,
    location: this.location,
    startDate: this.startDate,
    endDate: this.endDate,
    capacity: this.capacity,
    status: this.status,
    eventType: this.eventType,
    organizer: this.organizer,
    slug: this.slug,
    tags: this.tags,
    featuredImage: this.featuredImage,
    registrationRequired: this.registrationRequired,
    registrationDeadline: this.registrationDeadline,
    registrationLink: this.registrationLink,
    contactEmail: this.contactEmail,
    contactPhone: this.contactPhone,
    requirements: this.requirements,
    agenda: this.agenda,
    viewCount: this.viewCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
