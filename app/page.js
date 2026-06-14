"use client";

import { useState } from "react";
import AuthPages from "../components/admin/AuthPages";
import EcommerceAdmin from "../components/admin/EcommerceAdmin";

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  if (loggedIn) return <EcommerceAdmin onLogout={() => setLoggedIn(false)} />;
  return <AuthPages onLoginSuccess={() => setLoggedIn(true)} />;
}