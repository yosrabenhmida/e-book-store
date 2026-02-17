const router = require("express").Router();
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const userController = require("../controller/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

// ── CLIENT (connecté) ──────────────────────────────────────
router.get("/profile", protect, userController.getProfile);
router.put("/profile", protect, userController.updateProfile);
router.put("/password", protect, userController.updatePassword);

// ── ADMIN – CRUD clients ───────────────────────────────────
router.get("/clients", protect, authorize("admin"), userController.getClients);
router.post(
  "/clients",
  protect,
  authorize("admin"),
  userController.createClient,
); // ✅ NOUVEAU
router.put(
  "/clients/:id",
  protect,
  authorize("admin"),
  userController.updateClient,
); // ✅ NOUVEAU
router.delete("/:id", protect, authorize("admin"), userController.deleteUser);

// ── AUTH ──────────────────────────────────────────────────
router.post("/register", (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password)
    return res
      .status(400)
      .send({ status: "notok", msg: "Please enter all required data" });

  User.findOne({ email })
    .then((user) => {
      if (user)
        return res
          .status(400)
          .send({ status: "notokmail", msg: "Email already exists" });

      const newUser = new User({ username, email, password, role });

      bcrypt.genSalt(10, (err, salt) => {
        if (err)
          return res
            .status(500)
            .send({ status: "error", msg: "Internal server error" });

        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err)
            return res
              .status(500)
              .send({ status: "error", msg: "Internal server error" });

          newUser.password = hash;
          newUser
            .save()
            .then((user) => {
              jwt.sign(
                { id: user.id },
                config.get("jwtSecret"),
                { expiresIn: config.get("tokenExpire") },
                (err, token) => {
                  if (err)
                    return res
                      .status(500)
                      .send({ status: "error", msg: "Internal server error" });
                  res.status(200).send({
                    status: "ok",
                    msg: "Successfully registered",
                    token,
                    user: {
                      id: user.id,
                      username: user.username,
                      email: user.email,
                      role: user.role,
                    },
                  });
                },
              );
            })
            .catch(() =>
              res
                .status(500)
                .send({ status: "error", msg: "Internal server error" }),
            );
        });
      });
    })
    .catch(() =>
      res.status(500).send({ status: "error", msg: "Internal server error" }),
    );
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "email et mot de passe obligatoires" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "email invalide" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "mot de passe invalide" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || config.get("jwtSecret"),
      { expiresIn: "1h" },
    );

    res.json({ token, username: user.username, role: user.role });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
