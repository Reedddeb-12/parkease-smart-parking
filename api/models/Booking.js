const mongoose = require('mongoose');
const crypto = require('crypto');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  parkingLot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLot',
    required: [true, 'Parking lot is required']
  },
  vehicle: {
    name: {
      type: String,
      required: true
    },
    number: {
      type: String,
      required: true,
      uppercase: true
    },
    type: {
      type: String,
      enum: ['car', 'bike', 'suv', 'truck'],
      required: true
    }
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 hour'],
    max: [168, 'Duration cannot exceed 168 hours (1 week)']
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date,
    required: true
  },
  actualEndTime: {
    type: Date
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [1, 'Amount must be at least ₹1']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'expired'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  qrCode: {
    type: String,
    unique: true,
    required: true
  },
  entryTime: {
    type: Date
  },
  exitTime: {
    type: Date
  },
  extensions: [{
    duration: Number,
    amount: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500
    },
    timestamp: Date
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ parkingLot: 1, status: 1 });
bookingSchema.index({ status: 1, endTime: 1 });
bookingSchema.index({ qrCode: 1 });

// Virtual for total duration including extensions
bookingSchema.virtual('totalDuration').get(function() {
  const extensionDuration = this.extensions.reduce((total, ext) => total + ext.duration, 0);
  return this.duration + extensionDuration;
});

// Virtual for total amount including extensions
bookingSchema.virtual('totalAmount').get(function() {
  const extensionAmount = this.extensions.reduce((total, ext) => total + ext.amount, 0);
  return this.amount + extensionAmount;
});

// Virtual for booking status display
bookingSchema.virtual('statusDisplay').get(function() {
  const now = new Date();
  
  if (this.status === 'cancelled') return 'Cancelled';
  if (this.status === 'completed') return 'Completed';
  if (this.status === 'expired') return 'Expired';
  
  if (this.entryTime && !this.exitTime) return 'Parked';
  if (now > this.endTime && this.status === 'active') return 'Overdue';
  if (now < this.startTime) return 'Upcoming';
  if (this.status === 'active') return 'Active';
  
  return 'Pending';
});

// Virtual for time remaining
bookingSchema.virtual('timeRemaining').get(function() {
  if (this.status !== 'active' || this.exitTime) return 0;
  
  const now = new Date();
  const endTime = new Date(this.endTime);
  const remaining = endTime - now;
  
  return Math.max(0, Math.floor(remaining / (1000 * 60))); // minutes
});

// Generate unique QR code before saving
bookingSchema.pre('save', function(next) {
  if (!this.qrCode) {
    this.qrCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  
  // Calculate end time if not set
  if (!this.endTime && this.startTime && this.duration) {
    this.endTime = new Date(this.startTime.getTime() + (this.duration * 60 * 60 * 1000));
  }
  
  next();
});

// Method to extend booking
bookingSchema.methods.extend = function(additionalHours, additionalAmount) {
  this.extensions.push({
    duration: additionalHours,
    amount: additionalAmount
  });
  
  // Update end time
  this.endTime = new Date(this.endTime.getTime() + (additionalHours * 60 * 60 * 1000));
  
  return this.save();
};

// Method to mark entry
bookingSchema.methods.markEntry = function() {
  this.entryTime = new Date();
  this.status = 'active';
  return this.save();
};

// Method to mark exit
bookingSchema.methods.markExit = function() {
  this.exitTime = new Date();
  this.actualEndTime = this.exitTime;
  this.status = 'completed';
  return this.save();
};

// Method to cancel booking
bookingSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  if (reason) this.notes = reason;
  return this.save();
};

// Static method to find active bookings
bookingSchema.statics.findActive = function() {
  return this.find({
    status: 'active',
    endTime: { $gt: new Date() }
  }).populate('user parkingLot');
};

// Static method to find expired bookings
bookingSchema.statics.findExpired = function() {
  return this.find({
    status: 'active',
    endTime: { $lt: new Date() }
  });
};

// Static method to get user booking history
bookingSchema.statics.getUserHistory = function(userId, limit = 10) {
  return this.find({ user: userId })
    .populate('parkingLot', 'name address')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Booking', bookingSchema);