const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const transactionSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const savingsTransactionSchema = new Schema({
  name: { type: String, default: "Savings" }, 
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });


const userSchema = new Schema({
  firstName: { type: String, required: [true, "first name is required"] },
  lastName: { type: String, required: [true, "last name is required"] },
  email: {
    type: String,
    required: [true, "email address is required"],
    unique: [true, "this email address has been used"],
  },
  password: { type: String, required: [true, "password is required"] },
  balance: { type: Number, default: 0 },
  transactions: [transactionSchema],
  totalSavingsAmount: { type: Number, default: 0 },
  savingsPutAway: { type: Number, default: 0},
  savingsTransactions: [{ type: Schema.Types.ObjectId, ref: 'SavingsTransaction' }]
});

userSchema.pre("save", function (next) {
  let user = this;
  if (!user.isModified("password")) return next();
  bcrypt
    .hash(user.password, 10)
    .then((hash) => {
      user.password = hash;
      next();
    })
    .catch((err) => next(error));
});

userSchema.methods.comparePassword = function (inputPassword) {
  let user = this;
  return bcrypt.compare(inputPassword, user.password);
};




module.exports = mongoose.model('SavingsTransaction', savingsTransactionSchema);
module.exports = mongoose.model("User", userSchema);
