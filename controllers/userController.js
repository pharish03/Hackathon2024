const model = require("../models/user");
const SavingsTransaction = require('../models/user');

exports.new = (req, res) => {
  return res.render("user/signup");
};

exports.create = (req, res, next) => {
  let user = new model(req.body);
  user
    .save()
    .then((user) => res.redirect("/users/login"))
    .catch((err) => {
      if (err.name === "ValidationError") {
        req.flash("error", err.message);
        return res.redirect("/users/signup");
      }

      if (err.code === 11000) {
        req.flash("error", "Email has been used");
        return res.redirect("/users/signup");
      }

      next(err);
    });
};

exports.getUserLogin = (req, res) => {
  return res.render("user/login");
};

exports.login = (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;
  model
    .findOne({ email: email })
    .then((user) => {
      if (!user) {
        console.log("wrong email address");
        req.flash("error", "Wrong email address or password");
        return res.redirect("/users/login");
      } else {
        user.comparePassword(password).then((result) => {
          if (result) {
            req.session.user = user._id;
            req.flash("success", "You have successfully logged in");
            return res.redirect("/users/overview");
          } else {
            req.flash("error", "Wrong email address or password");
            return res.redirect("/users/login");
          }
        });
      }
    })
    .catch((err) => next(err));
};

exports.profile = (req, res, next) => {
  let id = req.session.user;
  model
    .findById(id)
    .populate('savingsTransactions')
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.render("./user/overview", { user: user });
    })
    .catch((err) => next(err));
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    else res.redirect("/");
  });
};

exports.updateBalance = (req, res, next) => {
  const paycheck = parseFloat(req.body.paycheck);
  if (isNaN(paycheck) || paycheck <= 0) {
    req.flash(
      "error",
      "Please enter a valid positive number for the paycheck."
    );
    return res.redirect("/users/overview");
  }
  const userId = req.session.user;
  model
    .findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      user.balance += paycheck;

      return user.save();
    })
    .then((updatedUser) => {
      console.log("User after balance update:", updatedUser);
      res.redirect("/users/overview");
    })
    .catch((err) => {
      console.error("Error updating balance:", err);
      next(err);
    });
};
exports.subtractFromBalance = (req, res, next) => {
  const transactionAmount = parseFloat(req.body.priceOfTransaction); 
  const nameOfTransaction = req.body.nameOfTransaction;

  if (isNaN(transactionAmount) || transactionAmount <= 0) {
      req.flash('error', 'Please enter a valid positive number for the transaction amount.');
      return res.redirect('/users/overview');
  }
  const userId = req.session.user;
  model.findById(userId)
      .then(user => {
          if (!user) {
              return res.status(404).json({ error: 'User not found' });
          }
          if (user.balance < transactionAmount) {
              req.flash('error', 'Insufficient balance for withdrawal.');
              return res.redirect('/users/overview');
          }
          user.balance -= transactionAmount;
          const newTransaction = {
              name: nameOfTransaction,
              price: transactionAmount
          };
          user.transactions.push(newTransaction);
          return user.save();
      })
      .then(updatedUser => {
          console.log('User after balance update:', updatedUser);
          req.flash('success', 'Transaction completed successfully.');
          res.redirect('/users/overview');
      })
      .catch(err => {
          console.error('Error updating balance:', err);
          next(err);
      });
};

exports.updateSavings = (req, res, next) => {
  const savingsAmount = parseFloat(req.body.savings);
  if (isNaN(savingsAmount) || savingsAmount <= 0) {
    req.flash("error", "Please enter a valid positive number for savings.");
    return res.redirect("/users/overview"); 
  }

  const userId = req.session.user;

  model.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const newSavingsTransaction = {
        name: "Savings",
        price: savingsAmount,
        date: new Date()
      };

      user.savingsTotal += savingsAmount;

      user.totalSavingsAmount += savingsAmount;

      return user.save();
    })
    .then((updatedUser) => {
      console.log("User after savings update:", updatedUser);
      req.flash("success", "Savings updated successfully.");
      res.redirect("/users/overview");
    })
    .catch((err) => {
      console.error("Error updating savings:", err);
      req.flash("error", "An error occurred while updating savings.");
      next(err);
    });
};

exports.savingsTotal = (req, res, next) => {
  const newAmount = parseFloat(req.body.savingsTotal);
  if (isNaN(newAmount) || newAmount <= 0) {
    req.flash("error", "Please enter a valid positive number for the amount.");
    return res.redirect("/users/overview"); 
  }
  const userId = req.session.user;

  model.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      user.totalSavingsAmount = newAmount;

      return user.save();
    })
    .then((updatedUser) => {
      console.log("User after savings total update:", updatedUser);
      req.flash("success", "Savings total updated successfully.");
      res.redirect("/users/overview");
    })
    .catch((err) => {
      console.error("Error updating savings total:", err);
      req.flash("error", "An error occurred while updating savings total.");
      next(err);
    });
};



exports.updateSavingsPutAway = (req, res, next) => {
  const newAmount = parseFloat(req.body.savingsPutAway);
  if (isNaN(newAmount) || newAmount <= 0) {
    req.flash("error", "Please enter a valid positive number for the amount put away.");
    return res.redirect("/users/overview");
  }
  const userId = req.session.user;
  model.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      user.savingsPutAway += newAmount;

      return user.save();
    })
    .then((updatedUser) => {
      console.log("User after savings put away update:", updatedUser);
      req.flash("success", "Savings put away updated successfully.");
      res.redirect("/users/overview");
    })
    .catch((err) => {
      console.error("Error updating savings put away:", err);
      req.flash("error", "An error occurred while updating savings put away.");
      next(err);
    });
};