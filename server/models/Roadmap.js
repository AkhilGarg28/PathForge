import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true
    },
    url: {
      type: String,
      required: [true, 'Resource url is required'],
      trim: true
    },
    type: {
      type: String,
      enum: {
        values: ['video', 'article', 'docs'],
        message: '{VALUE} is not a valid resource type'
      },
      required: [true, 'Resource type is required']
    }
  },
  { _id: false }
);

const moduleSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
      required: [true, 'moduleId is required'],
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Module description is required'],
      trim: true
    },
    resourceTags: {
      type: [String],
      default: []
    },
    resources: {
      type: [resourceSchema],
      default: []
    },
    estimatedHours: {
      type: Number,
      required: [true, 'estimatedHours is required'],
      min: [1, 'estimatedHours must be at least 1']
    },
    status: {
      type: String,
      enum: {
        values: ['locked', 'active', 'complete'],
        message: '{VALUE} is not a valid module status'
      },
      default: 'locked'
    },
    checkpointScore: {
      type: Number,
      default: null,
      min: [0, 'checkpointScore cannot be less than 0'],
      max: [100, 'checkpointScore cannot be greater than 100']
    },
    isNewlyAdded: {
      type: Boolean,
      default: false
    }
  },
  {
    _id: false,
    toJSON: {
      transform(doc, ret) {
        ret.isNew = Boolean(
          ret.isNewlyAdded || (ret.moduleId && ret.moduleId.includes('remedial'))
        );
        return ret;
      }
    }
  }
);

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      unique: true,
      index: true
    },
    roleId: {
      type: String,
      required: [true, 'roleId is required'],
      trim: true
    },
    dimensionScores: {
      type: Map,
      of: Number,
      required: [true, 'dimensionScores are required']
    },
    modules: {
      type: [moduleSchema],
      required: [true, 'modules are required'],
      validate: {
        validator: function (mods) {
          return Array.isArray(mods) && mods.length > 0;
        },
        message: 'Roadmap must contain at least one module'
      }
    },
    readinessScore: {
      type: Number,
      default: 0,
      min: [0, 'readinessScore cannot be less than 0'],
      max: [100, 'readinessScore cannot be greater than 100']
    },
    generatedBy: {
      type: String,
      enum: {
        values: ['llm', 'fallback'],
        message: '{VALUE} is not a valid generatedBy option'
      },
      required: [true, 'generatedBy is required']
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        if (Array.isArray(ret.modules)) {
          ret.modules = ret.modules.map((m) => ({
            ...m,
            isNew: Boolean(m.isNewlyAdded || (m.moduleId && m.moduleId.includes('remedial')))
          }));
        }
        return ret;
      }
    }
  }
);

const Roadmap = mongoose.model('Roadmap', roadmapSchema);

export default Roadmap;
