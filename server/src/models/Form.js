import mongoose from 'mongoose';

const questionTypes = [
  'Short Text',
  'Long Text',
  'Number',
  'Multiple Choice',
  'Checkbox',
  'Email'
];

const questionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: questionTypes },
    required: { type: Boolean, default: false },
    options: {
      type: [String],
      default: undefined,
      validate: {
        validator(options) {
          if (!['Multiple Choice', 'Checkbox'].includes(this.type)) {
            return options === undefined || options.length === 0;
          }
          return Array.isArray(options) && options.length > 0 &&
            options.every((option) => typeof option === 'string' && option.trim().length > 0);
        },
        message: 'Multiple Choice and Checkbox questions require options'
      }
    },
    regex: {
      type: String,
      trim: true,
      validate: {
        validator(value) {
          return value === undefined || ['Short Text', 'Long Text'].includes(this.type);
        },
        message: 'Regex validation is only supported for text questions'
      }
    }
  },
  { _id: true }
);

const formSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
    questions: {
      type: [questionSchema],
      default: [],
      validate: {
        validator(questions) {
          return Array.isArray(questions);
        },
        message: 'Questions must be an array'
      }
    },
    published: { type: Boolean, default: false },
    acceptingResponses: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export { questionTypes };
export default mongoose.model('Form', formSchema);
