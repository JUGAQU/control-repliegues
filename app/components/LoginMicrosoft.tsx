"use client";

import { signIn } from "next-auth/react";

export default function LoginMicrosoft() {
  return (
    <button
      type="button"
      onClick={() => signIn("azure-ad", { callbackUrl: "/" })}
      style={{
        background: "#0078d4",
        color: "white",
        border: "none",
        borderRadius: 6,
        padding: "8px 14px",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      Entrar con Microsoft
    </button>
  );
}
