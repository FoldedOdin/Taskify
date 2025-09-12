import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Todo text is required'],
    trim: true,
    maxlength: [500, 'Todo text cannot exceed 500 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['Work', 'Personal', 'Shopping', 'Health'],
    default: 'Personal'
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for better query performance
todoSchema.index({ userId: 1, createdAt: -1 });
todoSchema.index({ userId: 1, category: 1 });
todoSchema.index({ userId: 1, priority: 1 });
todoSchema.index({ userId: 1, completed: 1 });

// Virtual for checking if todo is overdue
todoSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.completed) return false;
  return new Date() > this.dueDate;
});

// Static method to get todos by user
todoSchema.statics.findByUser = function(userId, filters = {}) {
  const query = { userId };
  
  if (filters.category) query.category = filters.category;
  if (filters.priority) query.priority = filters.priority;
  if (typeof filters.completed === 'boolean') query.completed = filters.completed;
  
  return this.find(query).sort({ order: 1, createdAt: -1 });
};

// Instance method to toggle completion
todoSchema.methods.toggleComplete = function() {
  this.completed = !this.completed;
  return this.save();
};

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;