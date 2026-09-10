import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true,
    collection: 'comments',
  }
);

commentSchema.index({ task: 1, createdAt: 1 });

export const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
