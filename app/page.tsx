"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoginMicrosoft from "./components/LoginMicrosoft";

export default function Home() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/listado");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Cargando...</div>;
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

        <LoginMicrosoft />
      </div>
    </div>
  );
}
