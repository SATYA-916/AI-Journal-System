import mongoose from 'mongoose';

const JournalEntrySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    ambience: { type: String, required: true, enum: ['forest', 'ocean', 'mountain'] },
    text: { type: String, required: true },
    emotion: { type: String, default: null },
    keywords: { type: [String], default: [] },
    summary: { type: String, default: null },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

export const JournalEntry = mongoose.model('JournalEntry', JournalEntrySchema);
