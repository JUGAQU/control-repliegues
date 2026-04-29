"use client";


import { useSearchParams } from "next/navigation";
import CabeceraFicha from "../components/CabeceraFicha";

export default function Actuaciones() {
  const searchParams = useSearchParams();
  const grupo = searchParams.get("grupo") || "";

  const formData = {};
  const handleChange = () => {};
  const provincias: any[] = [];
  const empresasPI: any[] = [];
  const setMostrarMemoria = () => {};

  return (
    <>
      <CabeceraFicha
        formData={formData}
        handleChange={handleChange}
        provincias={provincias}
        empresasPI={empresasPI}
        setMostrarMemoria={setMostrarMemoria}
      />

      <div
        style={{
          background: "#dfe3e6",
          minHeight: "100vh",
          fontFamily: "Arial",
          padding: 20,
        }}
      >
        <div
          style={{
            background: "#c9e3f2",
            border: "1px solid #b7c6d0",
            padding: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              style={{
                background: "#0070c0",
                color: "#fff",
                border: "none",
                padding: "10px 18px",
                borderRadius: 4,
                fontWeight: "bold",
                fontSize: 24,
              }}
            >
              Actuaciones
            </button>

            <div style={{ fontSize: 32, fontWeight: "bold", color: "#0b5394" }}>
              {grupo}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
