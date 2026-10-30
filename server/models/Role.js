import mongoose from 'mongoose';

const dimensionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, 'Dimension id is required'],
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Dimension name is required'],
      trim: true
    }
  },
  { _id: false }
);

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Role slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Role description is required'],
      trim: true
    },
    dimensions: {
      type: [dimensionSchema],
      required: true,
      validate: {
        validator: function (dims) {
          return Array.isArray(dims) && dims.length > 0;
        },
        message: 'A role must include at least one dimension'
      }
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

const Role = mongoose.model('Role', roleSchema);

export default Role;
