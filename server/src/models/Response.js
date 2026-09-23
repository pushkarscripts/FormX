import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema(
  {
    form: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
      index: true
    },
    answers: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  { timestamps: { createdAt: 'submittedAt', updatedAt: false } }
);

export default mongoose.model('Response', responseSchema);
