"use client";


import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import cabeceraActuaciones from "../components/cabeceraActuaciones";

export default function Actuaciones() {
  const searchParams = useSearchParams();
  const grupo = searchParams.get("grupo") || "";
  const id = searchParams.get("id");

  const [formData, setFormData] = useState<any>(null);

  const handleChange = () => {};
  const provincias: any[] = [];
  const empresasPI: any[] = [];
  const setMostrarMemoria = () => {};

  useEffect(() => {
    const cargarFicha = async () => {
      if (!id) return;

      const res = await fetch("/api/fichas");
      const data = await res.json();

      if (Array.isArray(data)) {
        const registro = data.find((d: any) => String(d.id) === String(id));
        if (registro) setFormData(registro);
      }
    };

    cargarFicha();
  }, [id]);

  if (!formData) {
    return <div style={{ padding: 20 }}>Cargando actuaciones...</div>;
  }

  return (
    <>
      <cabeceraActuaciones
        formData={formData}
        handleChange={handleChange}
        provincias={provincias}
        empresasPI={empresasPI}
        setMostrarMemoria={setMostrarMemoria}
      />

      <div style={{ background:"#dfe3e6", minHeight:"100vh", fontFamily:"Arial", padding:20 }}>
        <div style={{ background:"#c9e3f2", border:"1px solid #b7c6d0", padding:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <button style={{ background:"#0070c0", color:"#fff", border:"none", padding:"10px 18px", borderRadius:4, fontWeight:"bold", fontSize:24 }}>
              Actuaciones
            </button>

            <div style={{ fontSize:32, fontWeight:"bold", color:"#0b5394" }}>
              {grupo}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
