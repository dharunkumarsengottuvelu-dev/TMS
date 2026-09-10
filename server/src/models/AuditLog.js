import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['ADMIN', 'EMPLOYEE'],
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entity: {
      type: String,
      required: true,
      enum: ['TASK', 'EMPLOYEE', 'AUTH', 'SYSTEM'],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ip: {
      type: String,
      default: '127.0.0.1',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'audit_logs',
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ entity: 1, createdAt: -1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
