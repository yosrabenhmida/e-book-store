const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ✅ GET - Profil utilisateur connecté
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ PUT - Mettre à jour le profil
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    if (req.body.email && req.body.email !== user.email) {
      const exists = await User.findOne({ email: req.body.email });
      if (exists)
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }
    user.username = req.body.name || user.username;
    user.email = req.body.email || user.email;
    const u = await user.save();
    res.json({
      message: "Profil mis à jour",
      user: { _id: u._id, username: u.username, email: u.email, role: u.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ PUT - Changer le mot de passe
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res
        .status(400)
        .json({
          message: "Veuillez fournir l'ancien et le nouveau mot de passe",
        });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "Minimum 6 caractères" });
    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mot de passe actuel incorrect" });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: "Mot de passe modifié avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ADMIN – voir tous les clients
exports.getClients = async (req, res) => {
  try {
    const clients = await User.find({ role: "client" }).select("-password");
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ADMIN – créer un client
exports.createClient = async (req, res) => {
  try {
    const { username, email, password, phone, avatar } = req.body;
    if (!username || !email || !password)
      return res
        .status(400)
        .json({ message: "Nom, email et mot de passe sont obligatoires" });
    if (password.length < 6)
      return res
        .status(400)
        .json({
          message: "Le mot de passe doit contenir au moins 6 caractères",
        });
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = await User.create({
      username,
      email,
      password: hashed,
      role: "client",
      phone: phone || "",
      avatar: avatar || "",
      totalOrders: 0,
      totalSpent: 0,
    });
    const result = await User.findById(user._id).select("-password");
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ADMIN – modifier un client
exports.updateClient = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    if (req.body.email && req.body.email !== user.email) {
      const exists = await User.findOne({ email: req.body.email });
      if (exists)
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }
    user.username = req.body.username ?? user.username;
    user.email = req.body.email ?? user.email;
    user.phone = req.body.phone ?? user.phone;
    user.avatar = req.body.avatar ?? user.avatar;
    user.totalOrders = req.body.totalOrders ?? user.totalOrders;
    user.totalSpent = req.body.totalSpent ?? user.totalSpent;
    if (req.body.password && req.body.password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
    const updated = await user.save();
    const result = await User.findById(updated._id).select("-password");
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ADMIN – supprimer un client
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ADMIN – changer le rôle
exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    user.role = req.body.role;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
