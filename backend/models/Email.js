import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: String,
  sender: String,
  date: Date
});

export default mongoose.model('Email', emailSchema);
