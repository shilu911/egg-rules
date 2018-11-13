'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const ReportSchema = new Schema({
    shift: {
      type: String,
    },
    product: {
      type: String,
    },
    numberOfBoxes: {
      type: Number,
    },
    date: {
      type: String,
    },
    isReviewed: {
      type: Boolean,
    },
    owner: {
      type: String,
    },
    rootOnly: {
      type: String,
    }
  });
  return mongoose.model('Report', ReportSchema);
};
