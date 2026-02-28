import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Interface representing the User document fields
 */
export interface IUser extends Document {
  email: string;
  password: string;
  createdAt: Date; // from timestamps: true
  updatedAt: Date; // from timestamps: true
}

/**
 * User Schema
 * Stores user authentication data (email and hashed password)
 */
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    }
  },
  {
    timestamps: true
  }
);

// Export the User model
const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;