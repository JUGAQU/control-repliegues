"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 30,
        background: "#f5f5f5",
      }}
    >
      {/* LOGO */}
      <img
        src="/logo.png"
        alt="Logo"
        style={{ maxWidth: 300 }}
      />

      {/* BOTÓN */}
      <button
        onClick={() => router.push("/listado")}
        style={{
          padding: "12px 30px",
          fontSize: 16,
          background: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        Entrar
      </button>
    </div>
  );
}
