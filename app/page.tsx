"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    // 🔐 usuario y contraseña (puedes cambiarlos)
    if (user === "t732666" && pass === "21Huelvaasas") {
      router.push("/listado");
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0f2027, #2c5364)",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          background: "white",
          padding: 40,
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          textAlign: "center",
          width: 320,
        }}
      >
        {/* LOGO */}
        <img
          src="/logo.png"
          alt="Logo"
          style={{
            width: 220,
            marginBottom: 30,
          }}
        />

        {/* INPUT USER */}
        <input
          placeholder="Usuario"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
            borderRadius: 5,
            border: "1px solid #ccc",
          }}
        />

        {/* INPUT PASS */}
        <input
          type="usuario"
          placeholder="contraseña"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 15,
            borderRadius: 5,
            border: "1px solid #ccc",
          }}
        />

        {/* ERROR */}
        {error && (
          <div style={{ color: "red", marginBottom: 10 }}>
            {error}
          </div>
        )}

        {/* BOTÓN */}
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: 12,
            background: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontSize: 16,
            cursor: "pointer",
            transition: "0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#0059c1")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#0070f3")}
        >
          Entrar
        </button>
      </div>
    </div>
  );
}
