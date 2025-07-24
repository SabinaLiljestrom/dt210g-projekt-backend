import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  bookId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: {   type: String, required: true, trim: true, minlength: 1, },
  rating: { type: Number, required: true, min: 1, max: 5, },
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
