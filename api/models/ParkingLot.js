const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Parking lot name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Location coordinates are required'],
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates format'
      }
    }
  },
  totalSlots: {
    type: Number,
    required: [true, 'Total slots is required'],
    min: [1, 'Must have at least 1 slot'],
    max: [1000, 'Cannot exceed 1000 slots']
  },
  availableSlots: {
    type: Number,
    required: true,
    min: [0, 'Available slots cannot be negative'],
    validate: {
      validator: function(value) {
        return value <= this.totalSlots;
      },
      message: 'Available slots cannot exceed total slots'
    }
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Price per hour is required'],
    min: [1, 'Price must be at least ₹1'],
    max: [1000, 'Price cannot exceed ₹1000 per hour']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  amenities: [{
    type: String,
    enum: ['covered', 'security', 'cctv', 'lighting', 'washroom', 'elevator', 'disabled_access']
  }],
  operatingHours: {
    open: {
      type: String,
      default: '00:00',
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    close: {
      type: String,
      default: '23:59',
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    is24Hours: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  images: [{
    url: String,
    caption: String
  }],
  stats: {
    totalBookings: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    occupancyRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create geospatial index for location-based queries
parkingLotSchema.index({ location: '2dsphere' });
parkingLotSchema.index({ owner: 1 });
parkingLotSchema.index({ isActive: 1 });

// Virtual for occupancy percentage
parkingLotSchema.virtual('occupancyPercentage').get(function() {
  return Math.round(((this.totalSlots - this.availableSlots) / this.totalSlots) * 100);
});

// Virtual for availability status
parkingLotSchema.virtual('availabilityStatus').get(function() {
  const occupancy = this.occupancyPercentage;
  if (occupancy >= 100) return 'full';
  if (occupancy >= 80) return 'limited';
  return 'available';
});

// Virtual for distance (will be populated by queries)
parkingLotSchema.virtual('distance');

// Method to update availability
parkingLotSchema.methods.updateAvailability = function(change) {
  this.availableSlots += change;
  if (this.availableSlots < 0) this.availableSlots = 0;
  if (this.availableSlots > this.totalSlots) this.availableSlots = this.totalSlots;
  
  // Update occupancy rate
  this.stats.occupancyRate = this.occupancyPercentage;
  
  return this.save();
};

// Method to book a slot
parkingLotSchema.methods.bookSlot = function(amount) {
  if (this.availableSlots <= 0) {
    throw new Error('No slots available');
  }
  
  this.availableSlots -= 1;
  this.stats.totalBookings += 1;
  this.stats.totalRevenue += amount;
  this.stats.occupancyRate = this.occupancyPercentage;
  
  return this.save();
};

// Method to release a slot
parkingLotSchema.methods.releaseSlot = function() {
  if (this.availableSlots < this.totalSlots) {
    this.availableSlots += 1;
    this.stats.occupancyRate = this.occupancyPercentage;
  }
  
  return this.save();
};

// Static method to find nearby parking lots
parkingLotSchema.statics.findNearby = function(longitude, latitude, maxDistance = 5000) {
  return this.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        distanceField: 'distance',
        maxDistance: maxDistance,
        spherical: true,
        query: { isActive: true }
      }
    },
    {
      $addFields: {
        distanceKm: { $round: [{ $divide: ['$distance', 1000] }, 2] }
      }
    }
  ]);
};

module.exports = mongoose.models.ParkingLot || mongoose.model('ParkingLot', parkingLotSchema);
