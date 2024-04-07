const express = require("express");
const controller = require("../controllers/userController");

const router = express.Router();

// send html form for creating a new user account
router.get("/signup", controller.new);

// create a new user account
router.post("/", controller.create);

// send html for logging in
router.get("/login", controller.getUserLogin);

// authenticate user's login
router.post("/login", controller.login);

// send user's profile page
router.get("/overview", controller.profile);

// logout a user
router.get("/logout", controller.logout);

router.post("/updateBalance", controller.updateBalance);

router.post('/subtractFromBalance', controller.subtractFromBalance);

router.post('/updateSavings', controller.updateSavings);

router.post('/savingsTotal', controller.savingsTotal);

router.post('/updateSavingsPutAway', controller.updateSavingsPutAway);

module.exports = router;
