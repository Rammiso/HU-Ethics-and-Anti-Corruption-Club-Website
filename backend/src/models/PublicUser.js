import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Public user roles enum
export const USER_ROLES = {
  USER: "USER",
};

// User account status enum
export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
};

const publicUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false, // Never include password in queries by default
    },

    profile: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, "Name cannot exceed 100 characters"],
      },
      avatar: {
        type: String,
        default: null,
      },
    },

    role: {
      type: String,
      enum: {
        values: Object.values(USER_ROLES),
        message: "Role must be USER",
      },
      default: USER_ROLES.USER,
      required: true,
    },

    status: {
      type: String,
      enum: {
        values: Object.values(USER_STATUS),
        message: "Status must be ACTIVE, INACTIVE, or SUSPENDED",
      },
      default: USER_STATUS.ACTIVE,
      required: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    collection: "publicusers", // Separate collection from admins
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        return ret;
      },
    },
  }
);

// Indexes for performance
publicUserSchema.index({ status: 1 });
publicUserSchema.index({ createdAt: -1 });

// Virtual for checking if account is locked
publicUserSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
publicUserSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 12
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
publicUserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword) return false;

  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Instance method to increment login attempts
publicUserSchema.methods.incLoginAttempts = async function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours

  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }

  return this.updateOne(updates);
};

// Instance method to reset login attempts
publicUserSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

// Instance method to update last login
publicUserSchema.methods.updateLastLogin = async function () {
  return this.updateOne({
    $set: { lastLogin: new Date() },
  });
};

// Static method to find active user by email
publicUserSchema.statics.findActiveByEmail = function (email) {
  return this.findOne({
    email: email.toLowerCase(),
    status: USER_STATUS.ACTIVE,
  }).select("+password");
};

// Static method to create user
publicUserSchema.statics.createUser = async function (userData) {
  const user = new this(userData);
  return await user.save();
};

const PublicUser = mongoose.model("PublicUser", publicUserSchema);

export default PublicUser;
