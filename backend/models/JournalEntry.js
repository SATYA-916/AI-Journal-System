import mongoose from 'mongoose';

const JournalEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ambience: { type: String, required: true, enum: ['forest', 'ocean', 'mountain'] },
    encryptedText: { type: String, required: true },
    iv: { type: String, required: true },
    authTag: { type: String, required: true },
    textHash: { type: String, required: true, index: true },
    emotion: { type: String, default: null, index: true },
    keywords: { type: [String], default: [] },
    summary: { type: String, default: null },
    analysisStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending', index: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: true } }
);

JournalEntrySchema.index({ userId: 1, createdAt: -1 });
JournalEntrySchema.index({ createdAt: -1 });
JournalEntrySchema.index({ userId: 1, textHash: 1, createdAt: -1 });

export const JournalEntry = mongoose.model('JournalEntry', JournalEntrySchema);
