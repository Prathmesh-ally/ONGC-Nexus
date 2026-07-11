import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  file_type: { type: String, required: true },
  fileUrl: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  extracted_text: { type: String, required: true }
});

documentSchema.index({ extracted_text: 'text', metadata: 'text' });

const Document = mongoose.model('Document', documentSchema);

export default Document;
