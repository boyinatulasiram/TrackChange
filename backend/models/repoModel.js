const mongoose = require("mongoose");
const { Schema } = mongoose;

const RepositorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  content: [
    {
      type: String,
    },
  ],
  visibility: {
    type: Boolean,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  issues: [
    {
      type: Schema.Types.ObjectId,
      ref: "Issue",
    },
  ],
  commits: [
    {
      commitID: { type: String, required: true },
      message: { type: String },
      date: { type: String },
      files: [{ type: String }]
    }
  ]
},
{
    timestamps: true,
  }
);

const Repository = mongoose.model("Repository", RepositorySchema);
module.exports = Repository;
