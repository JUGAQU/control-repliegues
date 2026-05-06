"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CabeceraFicha from "../components/CabeceraFicha";
import { supabase } from "../lib/supabase";

export default function Actuaciones() {
const searchParams = useSearchParams();



  const [formData, setFormData] = useState<any>(null);

  const handleChange = () => {};
  const provincias: any[] = [];
  const empresasPI: any[] = [];
  const setMostrarMemoria = () => {};

  const atlas = searchParams.get("atlas") || "";
  const sgipe = searchParams.get("sgipe") || "";
  const grupoFiltro = searchParams.get("grupo") || "";
  const nservicios = searchParams.get("nservicios") || "";

  const [actuaciones, setActuaciones] = useState<any[]>([]);

useEffect(() => {
  const cargarFicha = async () => {
    if (!atlas) return;

    const res = await fetch("/api/fichas");
    const data = await res.json();

    if (Array.isArray(data)) {
      const registro = data.find(
        (d: any) => String(d.atlas).trim() === String(atlas).trim()
      );

      if (registro) {
        setFormData(registro);
      } else {
        setFormData({ atlas });
      }
    }
  };

  cargarFicha();
}, [atlas]);

  
useEffect(() => {
  const cargarActuaciones = async () => {
    if (!atlas) return;

let query = supabase
  .from("actuaciones")
  .select("*")
  .eq("atlas", atlas);

if (sgipe) {
  query = query.eq("sgipe", sgipe);
}

if (grupoFiltro) {
  query = query.eq("grupo", grupoFiltro);
}

    
const vacia = {
  atlas,
  sgipe,
  grupo: grupoFiltro,
  ec_pi: "",
  tecnicos_necesarios: "",
  tecnico_p_int: "",
  telefono_p_int: "",
  tecnico_p_ext: "",
  telefono_p_ext: "",
  gestor_atelco: "",
  numero_reasignaciones_tratadas: nservicios,
  fecha_prevista: "",
  actuacion_nocturna: false,
  estado_actuacion: "",
  observaciones_actuacion: "",
  fecha_certificacion: "",
};

const { data, error } = await query.order("id", { ascending: true });

console.log("DATA actuaciones:", data);
console.log("ERROR actuaciones:", error);

if (error) {
  setActuaciones([vacia]);
  return;
}

if (!data || data.length === 0) {
  setActuaciones([vacia]);
} else {
  setActuaciones(data);
}

  };

  cargarActuaciones();
}, [atlas, sgipe, grupoFiltro]);


if (!formData) {
  return <div style={{ padding: 20 }}>Cargando actuaciones...</div>;
}

const actualizarCampo = (index: number, campo: string, valor: string) => {
  const nuevas = [...actuaciones];
  nuevas[index] = {
    ...nuevas[index],
    [campo]: valor,
  };
  setActuaciones(nuevas);
};
  

  return (
    <>
      <CabeceraFicha
        formData={formData}
        handleChange={handleChange}
        provincias={provincias}
        empresasPI={empresasPI}
        setMostrarMemoria={setMostrarMemoria}
      />

      <div style={{ background:"#dfe3e6", minHeight:"100vh", fontFamily:"Arial", padding:20 }}>
        {/* 🔵 BARRA AZUL */} 
        <div style={{ background:"#c9e3f2", border:"1px solid #b7c6d0", padding:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <button style={{ background:"#0070c0", color:"#fff", border:"none", padding:"10px 18px", borderRadius:4, fontWeight:"bold", fontSize:24 }}>
              Actuaciones
            </button>

            <div style={{ fontSize:32, fontWeight:"bold", color:"#0b5394" }}>
              {grupoFiltro}
            </div>
          </div>
        </div>


<div style={{ padding: 10 }}>
  Actuaciones cargadas: {actuaciones.length}
</div>









        
        

        {/* 🔴 AQUÍ VAN LAS TARJETAS */}
        {actuaciones.map((a:any, index:number) => (



<div
  key={a.id || index}
  style={{
    background: "#7fe08a",
    borderTop: "2px solid #000",
    borderBottom: "2px solid #000",
    marginTop: 12,
    padding: 10,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  }}
>

  {/* 🔵 BLOQUE INTERIOR */}
  <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>

    {/*nºregistros */}
    <div style={{ display: "flex", gap: 5 }}>
      <CampoInputAuto label="Nº Reasig." value={a.numero_reasignaciones_tratadas || ""} minWidth={70} onChange={(value) => actualizarCampo(index, "numero_reasignaciones_tratadas", value)} />
    </div>

    {/* plta interior */}
    <div style={{ display: "flex", gap: 5 }}>
      <CampoInputAuto label="Empresa Planta Int." value={a.ec_pi || ""} minWidth={150} onChange={(value) => actualizarCampo(index, "ec_pi", value)} />
      <CampoInputAuto label="Nº Tec." value={a.tecnicos_necesarios || ""} minWidth={50} onChange={(value) => actualizarCampo(index, "tecnicos_necesarios", value)} />
      <CampoInputAuto label="Técnico Responsable" value={a.tecnico_p_int || ""} minWidth={170} onChange={(value) => actualizarCampo(index, "tecnico_p_int", value)} />
      <CampoInputAuto label="Teléfono" value={a.telefono_p_int || ""} minWidth={80} onChange={(value) => actualizarCampo(index, "telefono_p_int", value)} />
    </div>

    {/*plta exterior */}
    <div style={{ display: "flex", gap: 5 }}>
      <CampoInputAuto label="Téc. Pta Ext." value={a.tecnico_p_ext || ""} minWidth={170} onChange={(value) => actualizarCampo(index, "tecnico_p_ext", value)} />
      <CampoInputAuto label="Teléfono" value={a.telefono_p_ext || ""} minWidth={80} onChange={(value) => actualizarCampo(index, "telefono_p_ext", value)} />
    </div>

        {/*atelco */}
    <div style={{ display: "flex", gap: 8 }}>
      <CampoInputAuto label="Gestor Atelco" value={a.gestor_atelco || ""} minWidth={170} onChange={(value) => actualizarCampo(index, "gestor_atelco", value)} />
    </div>

        {/*datpos actuacion */}
    <div style={{ display: "flex", gap: 8 }}>
      <CampoInputAuto label="Fecha Act." value={a.fecha_prevista || ""} minWidth={80} onChange={(value) => actualizarCampo(index, "fecha_prevista", value)} />
      <CampoInputAuto label="Estado actuación" value={a.estado_actuacion || ""} minWidth={100} onChange={(value) => actualizarCampo(index, "estado_actuacion", value)} />
      <CampoInputAuto label="Observaciones Actuación" value={a.observaciones_actuacion || ""} minWidth={550} onChange={(value) => actualizarCampo(index, "observaciones_actuacion", value)} />  
    </div>

  </div>

</div>

  










))}
            




        



        
      </div>
    </>
  );
}



function CampoInputAuto({
  label,
  value,
  minWidth = 100,
  onChange,
}: {
  label: string;
  value: string;
  minWidth?: number;
  onChange: (value: string) => void;
}) {
  return (
    <div style={{ width: minWidth, flex: "0 0 auto" }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: "bold",
          color: "#0b5394",
          marginBottom: 3,
        }}
      >
        {label}
      </div>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          height: 20,
          padding: "1px 5px",
          background: "#d9ead3",
          border: "1px solid #666",
          borderRadius: 4,
          fontSize: 11,
          boxSizing: "border-box",
          fontFamily: "Arial",
        }}
      />
    </div>
  );
}
