"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabase";
import LoginMicrosoft from "./components/LoginMicrosoft";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  // 👉 REDIRECCIÓN SI YA ESTÁ LOGUEADO CON MICROSOFT
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/listado");
    }
  }, [status, router]);

  const handleLogin = async () => {
    setError("");
    try {
      const email = user.trim() + "@app.com";

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        const msg = (error.message || "").toLowerCase();

        if (
          msg.includes("failed to fetch") ||
          msg.includes("fetch") ||
          msg.includes("network")
        ) {
          setError("No se puede iniciar sesión con CARU activo.");
        } else {
          setError(
            "Usuario o contraseña incorrectos. ¡Para acceder CARU no puede estar activo!"
          );
        }
        return;
      }

      router.push("/listado");
    } catch (e) {
      console.error("ERROR LOGIN:", e);
      setError("No se puede iniciar sesión con la VPN activa.");
    }
  };

  // 👉 Mientras carga sesión
  if (status === "loading") {
    return <div style={{ color: "white" }}>Cargando...</div>;
  }

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
        <img
          src="/logo.png"
          alt="Logo"
          style={{
            width: 220,
            marginBottom: 30,
          }}
        />

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

        <input
          type="password"
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

        {error && (
          <div style={{ color: "red", marginBottom: 10 }}>
            {error}
          </div>
        )}

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
            marginBottom: 12,
          }}
        >
          Entrar
        </button>

        {/* 👇 MICROSOFT */}
        <LoginMicrosoft />
      </div>
    </div>
  );
}
