import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  bookId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  rating: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
