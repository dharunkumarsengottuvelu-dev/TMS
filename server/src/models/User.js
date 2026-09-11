import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'EMPLOYEE'],
      default: 'EMPLOYEE',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Professional employee identity fields
    employeeId: {
      type: String,
      default: null,
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, 'Department cannot exceed 100 characters'],
      default: null,
    },
    designation: {
      type: String,
      trim: true,
      maxlength: [100, 'Designation cannot exceed 100 characters'],
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
      default: null,
    },
    joiningDate: {
      type: Date,
      default: null,
    },
    onboardingStatus: {
      type: String,
      enum: ['INVITED', 'ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    // Rate limiting for invitation resend
    lastInvitationSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'user', // Match Better Auth default collection name
  }
);

// Compound and search indexes for query performance
userSchema.index({ name: 'text', email: 'text', employeeId: 'text', department: 'text' });
userSchema.index({ role: 1, isActive: 1 });
// Unique index on employeeId only when it is a non-null string
userSchema.index(
  { employeeId: 1 },
  { unique: true, partialFilterExpression: { employeeId: { $type: 'string' } } }
);
userSchema.index({ onboardingStatus: 1 });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
