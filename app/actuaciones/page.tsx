"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CabeceraFicha from "../components/CabeceraFicha";
import { supabase } from "../lib/supabase";

export default function Actuaciones() {
  const searchParams = useSearchParams();
  const grupo = searchParams.get("grupo") || "";
  const id = searchParams.get("id");

  const [formData, setFormData] = useState<any>(null);

  const handleChange = () => {};
  const provincias: any[] = [];
  const empresasPI: any[] = [];
  const setMostrarMemoria = () => {};

  const atlas = searchParams.get("atlas") || "";
  const sgipe = searchParams.get("sgipe") || "";
  const grupoFiltro = searchParams.get("grupo") || "";
  const [actuaciones, setActuaciones] = useState<any[]>([]);

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

  useEffect(() => {
    const cargarActuaciones = async () => {
      if (!atlas) return;
  
      let query = supabase
        .from("actuaciones")
        .select("*")
        .eq("atlas", atlas);
  
      if (sgipe) query = query.eq("sgipe", sgipe);
      if (grupoFiltro) query = query.eq("grupo", grupoFiltro);
  
      const { data, error } = await query.order("id", { ascending: true });
  
      if (error) {
        console.error("Error cargando actuaciones:", error);
        return;
      }
  
      if (!data || data.length === 0) {
        setActuaciones([
          {
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
            numero_reasignaciones_tratadas: "",
            fecha_prevista: "",
            actuacion_nocturna: false,
            estado_actuacion: "",
            observaciones_actuacion: "",
            fecha_certificacion: "",
          },
        ]);
      } else {
        setActuaciones(data);
      }
    };
  
    cargarActuaciones();
  }, [atlas, sgipe, grupoFiltro]);





  

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
