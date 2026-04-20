"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Ficha() {
  const [formData, setFormData] = useState<any>(null);
  const [cambiosSinGuardar, setCambiosSinGuardar] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  // 🔥 CARGA CORRECTA
  useEffect(() => {
    const cargar = async () => {
      if (!id) return;

      const res = await fetch("/api/fichas");
      const data = await res.json();

      console.log("ID URL:", id);
      console.log("DATA:", data);

      if (Array.isArray(data)) {
        const registro = data.find(
          (d: any) => String(d.id) === String(id)
        );

        console.log("REGISTRO ENCONTRADO:", registro);

        if (registro) {
          setFormData(registro);
        } else {
          console.error("❌ No se encontró el registro");
        }
      }
    };

    cargar();
  }, [id]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    setCambiosSinGuardar(true);
  };

  // 🔥 GUARDAR BIEN EN SUPABASE
  const guardarCambios = async () => {
    if (!formData?.id) {
      alert("Error: no hay ID");
      return;
    }

    console.log("GUARDANDO:", formData);

    const { data, error } = await supabase
      .from("fichas")
      .update({
        lote: formData.lote,
        nombre: formData.nombre,
        provincia: formData.provincia,
        miga: formData.miga,
        coordenadas: formData.coordenadas,
        tipo_edificio: formData.tipo_edificio,
        tipo_repliegue: formData.tipo_repliegue,
        tipo_senda: formData.tipo_senda,
        fecha_abandono: formData.fecha_abandono,
        prioritario: formData.prioritario,
      })
      .eq("atlas", formData.atlas)
      .select(); // 👈 clave

    console.log("UPDATE RESULT:", data);

    if (error) {
      console.error("Error guardando:", error);
      alert("Error al guardar");
    } else {
      alert("Guardado en Supabase ✅");
      setCambiosSinGuardar(false);

      // 🔥 REFRESCO CORRECTO
      router.replace("/listado");
      router.refresh();
    }
  };

  // 🛑 BLOQUEO HASTA CARGAR
  if (!formData) {
    return <div style={{ padding: 20 }}>Cargando ficha...</div>;
  }

  const campo = {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
  };

  const valor = {
    background: "#d9eef7",
    padding: "3px 8px",
    borderRadius: 4,
    border: "1px solid #bcd",
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
        <button onClick={guardarCambios}>💾</button>

        <button
          onClick={() => {
            if (cambiosSinGuardar) {
              const confirmar = confirm("Tienes cambios sin guardar. ¿Salir sin guardar?");
              if (!confirmar) return;
            }
            router.push("/listado");
          }}
        >
          ✖
        </button>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          padding: 15,
          background: "#f5f5f5",
          display: "flex",
          flexWrap: "wrap",
          gap: 15,
        }}
      >
        <div style={campo}>
          <span>Atlas:</span>
          <input
            name="atlas"
            value={formData.atlas || ""}
            readOnly
            style={{ ...valor, width: 70, background: "#eee" }}
          />
        </div>

        <div style={campo}>
          <span>Lote:</span>
          <input name="lote" value={formData.lote || ""} onChange={handleChange} style={{ ...valor, width: 100 }} />
        </div>

        <div style={campo}>
          <span>Nombre:</span>
          <input name="nombre" value={formData.nombre || ""} onChange={handleChange} style={{ ...valor, width: 200 }} />
        </div>

        <div style={campo}>
          <span>Provincia:</span>
          <input name="provincia" value={formData.provincia || ""} onChange={handleChange} style={{ ...valor, width: 90 }} />
        </div>

        <div style={campo}>
          <span>Miga:</span>
          <input name="miga" value={formData.miga || ""} onChange={handleChange} style={{ ...valor, width: 70 }} />
        </div>

        <div style={campo}>
          <span>Coordenadas:</span>
          <input name="coordenadas" value={formData.coordenadas || ""} onChange={handleChange} style={{ ...valor, width: 130 }} />
        </div>

        <div style={campo}>
          <span>Tipo Edificio:</span>
          <input name="tipo_edificio" value={formData.tipo_edificio || ""} onChange={handleChange} style={{ ...valor, width: 60 }} />
        </div>

        <div style={campo}>
          <span>Tipo Repliegue:</span>
          <input name="tipo_repliegue" value={formData.tipo_repliegue || ""} onChange={handleChange} style={{ ...valor, width: 80 }} />
        </div>

        <div style={campo}>
          <span>Senda:</span>
          <input name="tipo_senda" value={formData.tipo_senda || "ACELERADA_2026"} onChange={handleChange} style={{ ...valor, width: 130 }} />
        </div>

        <div style={campo}>
          <span>Fecha Abandono:</span>
          <input name="fecha_abandono" value={formData.fecha_abandono || ""} onChange={handleChange} style={{ ...valor, width: 80 }} />
        </div>

        <div style={campo}>
          <span>Prioritaria:</span>
          <input name="prioritario" value={formData.prioritario || ""} onChange={handleChange} style={{ ...valor, width: 10 }} />
        </div>
      </div>
    

    

    {/* 🆕 NUEVO BLOQUE */}
<div
        style={{
          border: "1px solid #ccc",
          padding: 15,
          background: "#f5f5f5",
          display: "flex",
          flexWrap: "wrap",
          gap: 15,
        }}
>

  <div style={campo}>
    <span>E.C Planta Int.:</span>
    <input
      name="Empresa_Planta_Interior"
      value={formData.observaciones || ""}
      onChange={handleChange}
      style={{ ...valor, width: 250 }}
    />
  </div>

  <div style={campo}>
    <span>E.C Planta Ext.:</span>
    <input
      name="Empresa_Planta_Exterior"
      value={formData.estado || ""}
      onChange={handleChange}
      style={{ ...valor, width: 250 }}
    />
  </div>

  <div style={campo}>
    <span>Empresa Desmantelamiento:</span>
    <input
      name="Empresa_Desmantelamiento"
      value={formData.responsable || ""}
      onChange={handleChange}
      style={{ ...valor, width: 250 }}
    />
  </div>

</div>


    </div>
  );
}
