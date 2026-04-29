"use client";

import { useSearchParams } from "next/navigation";

export default function Actuaciones() {
  const searchParams = useSearchParams();
  const grupo = searchParams.get("grupo") || "";

  return (
    <div style={{ padding:20, fontFamily:"Arial" }}>
      <div
        style={{
          display:"flex",
          gap:8,
          alignItems:"center",
          padding:8,
          background:"#cfe8f6",
          border:"1px solid #9fc5e8"
        }}
      >
        <div
          style={{
            background:"#0070c0",
            color:"#fff",
            fontWeight:"bold",
            padding:"8px 12px",
            borderRadius:4
          }}
        >
          Actuaciones
        </div>

        <div style={{ fontWeight:"bold", color:"#0b5394" }}>
          {grupo}
        </div>
      </div>
    </div>
  );
}
