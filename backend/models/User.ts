import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  name: string;
  password: string;
  role: 'user' | 'admin' | 'accessibility';
  preferences: {
    language: string;
    accessibilityLevel: 'Basic' | 'Standard' | 'Enhanced';
    voiceSpeed: number;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    privacyMode: boolean;
    notifications: boolean;
    glossary: Array<{
      term: string;
      definition: string;
      language: string;
      createdAt: Date;
    }>;
    translationHistory: Array<{
      id: string;
      from: string;
      to: string;
      fromLang: string;
      toLang: string;
      date: string;
    }>;
  };
  profile: {
    avatar?: string;
    bio?: string;
    location?: string;
  };
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  findByEmail(email: string): Promise<IUser | null>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'accessibility'],
    default: 'user'
  },
  preferences: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi']
    },
    accessibilityLevel: {
      type: String,
      enum: ['Basic', 'Standard', 'Enhanced'],
      default: 'Standard'
    },
    voiceSpeed: {
      type: Number,
      default: 1.0,
      min: [0.5, 'Voice speed must be at least 0.5'],
      max: [2.0, 'Voice speed cannot exceed 2.0']
    },
    highContrast: {
      type: Boolean,
      default: false
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    privacyMode: {
      type: Boolean,
      default: false
    },
    notifications: {
      type: Boolean,
      default: true
    },
    glossary: [{
      term: {
        type: String,
        required: true
      },
      definition: {
        type: String,
        required: true
      },
      language: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    translationHistory: [{
      id: {
        type: String,
        required: true
      },
      from: {
        type: String,
        required: true
      },
      to: {
        type: String,
        required: true
      },
      fromLang: {
        type: String,
        required: true
      },
      toLang: {
        type: String,
        required: true
      },
      date: {
        type: String,
        required: true
      }
    }]
  },
  profile: {
    avatar: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    location: {
      type: String,
      maxlength: [100, 'Location cannot exceed 100 characters']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'preferences.language': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Hash password before updating
userSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate() as any;
  if (update.password) {
    try {
      const salt = await bcrypt.genSalt(12);
      update.password = await bcrypt.hash(update.password, salt);
    } catch (error) {
      next(error as Error);
    }
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Virtual for user's full profile
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    role: this.role,
    preferences: this.preferences,
    profile: this.profile,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt
  };
});

// Ensure virtuals are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export const User = mongoose.model<IUser>('User', userSchema);

// Export types for use in other parts of the application
export type UserDocument = IUser;
export type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: string;
  preferences: any;
  profile: any;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
};
