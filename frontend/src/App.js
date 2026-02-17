import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/Register";
import Livres from "./pages/admin/Livres";
import Categories from "./pages/admin/Categories";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/public/Home";
import Clients from "./pages/admin/Clients";
import Orders from "./pages/admin/Orders";
import DashboardAdmin from "./pages/admin/dashboardAdmin";
import BookDetails from "./pages/public/BookDetails";
import Profile from "./pages/client/Profile";
import BookDetail from "./pages/admin/BookDetail";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Page par défaut */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/books/:id" element={<BookDetails />} />
        <Route path="/admin/livres/:id" element={<BookDetail />} />
        {/* Pages admin */}
        <Route
          path="/dashboardAdmin"
          element={
            <>
              <Navbar />
              <DashboardAdmin />
            </>
          }
        />
        <Route
          path="/admin/livres"
          element={
            <>
              <Livres />
            </>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <>
              <Categories />
            </>
          }
        />
        <Route
          path="/admin/clients"
          element={
            <>
              <Clients />
            </>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <>
              <Orders />
            </>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <>
              <Profile />
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
