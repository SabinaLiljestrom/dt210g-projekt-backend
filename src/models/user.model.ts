import mongoose, { Document, Schema } from 'mongoose';

// Typdefinition för användare
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

// Skapa Mongoose-schema
const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Skapa och exportera modellen
const User = mongoose.model<IUser>('User', userSchema);
export default User;
