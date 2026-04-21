"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Ficha() {
  const [formData, setFormData] = useState<any>(null);
  const [cambiosSinGuardar, setCambiosSinGuardar] = useState(false);
  const [empresasPI, setEmpresasPI] = useState<any[]>([]);
  const [provincias, setProvincias] = useState<any[]>([]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  useEffect(() => {
    const cargarFicha = async () => {
      if (!id) return;

      const res = await fetch("/api/fichas");
      const data = await res.json();

      if (Array.isArray(data)) {
        const registro = data.find((d: any) => String(d.id) === String(id));

        if (registro) {
          setFormData(registro);
        } else {
          console.error("No se encontró el registro");
        }
      }
    };

    cargarFicha();
  }, [id]);

  useEffect(() => {
    const cargarEmpresasPI = async () => {
      const { data, error } = await supabase
        .from("empresaspi")
        .select("id, nombre")
        .order("nombre", { ascending: true });

      if (error) {
        console.error("Error cargando empresaspi:", error);
        return;
      }

      setEmpresasPI(data || []);
    };

    cargarEmpresasPI();
  }, []);

  useEffect(() => {
    const cargarProvincias = async () => {
      const { data, error } = await supabase
        .from("provincias")
        .select("id, nombre")
        .order("nombre", { ascending: true });

      if (error) {
        console.error("Error cargando provincias:", error);
        return;
      }

      setProvincias(data || []);
    };

    cargarProvincias();
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setCambiosSinGuardar(true);
  };

  const guardarCambios = async () => {
    if (!formData?.id) {
      alert("Error: no hay ID");
      return;
    }

    const { error } = await supabase
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
        proyecto_inversion: formData.proyecto_inversion,
        tecnico_analisis: formData.tecnico_analisis,
        tecnico_reasignaciones: formData.tecnico_reasignaciones,
        empresa_pi: formData.empresa_pi,
        empresa_pe: formData.empresa_pe,
        empresa_recicladora: formData.empresa_recicladora,
      })
      .eq("id", formData.id);

    if (error) {
      console.error("Error guardando:", error);
      alert("Error al guardar");
      return;
    }

    alert("Guardado en Supabase ✅");
    setCambiosSinGuardar(false);
    router.replace("/listado");
    router.refresh();
  };

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 15,
        }}
      >
        <button onClick={guardarCambios}>💾</button>

        <button
          onClick={() => {
            if (cambiosSinGuardar) {
              const confirmar = confirm(
                "Tienes cambios sin guardar. ¿Salir sin guardar?"
              );
              if (!confirmar) return;
            }
            router.push("/listado");
          }}
        >
          ✖
        </button>
      </div>

      {/* DATOS DE IDENTIFICACION */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: 15,
          background: "#f5f5f5",
          display: "flex",
          flexWrap: "wrap",
          gap: 15,
          marginBottom: 20,
        }}
      >
        <div style={campo}>
          <span>Atlas:</span>
          <input
            name="atlas"
            value={formData.atlas || ""}
            readOnly
            style={{ ...valor, width: 70, background: "#eee", color: "#666" }}
          />
        </div>

        <div style={campo}>
          <span>Lote:</span>
          <input
            name="lote"
            value={formData.lote || ""}
            onChange={handleChange}
            style={{ ...valor, width: 90 }}
          />
        </div>

        <div style={campo}>
          <span>Nombre:</span>
          <input
            name="nombre"
            value={formData.nombre || ""}
            onChange={handleChange}
            style={{ ...valor, width: 200 }}
          />
        </div>

        <div style={campo}>
          <span>Provincia:</span>
          <select
            name="provincia"
            value={formData.provincia || ""}
            onChange={handleChange}
            style={{ ...valor, width: 140 }}
          >
            <option value="">-- Seleccionar --</option>
            {provincias.map((provincia) => (
              <option key={provincia.id} value={provincia.nombre}>
                {provincia.nombre}
              </option>
            ))}
          </select>
        </div>

        <div style={campo}>
          <span>Miga:</span>
          <input
            name="miga"
            value={formData.miga || ""}
            onChange={handleChange}
            style={{ ...valor, width: 60 }}
          />
        </div>

        <div style={campo}>
          <span>Coordenadas:</span>
          <input
            name="coordenadas"
            value={formData.coordenadas || ""}
            onChange={handleChange}
            style={{ ...valor, width: 120 }}
          />
        </div>

        <div style={campo}>
          <span>Tipo Edificio:</span>
          <input
            name="tipo_edificio"
            value={formData.tipo_edificio || ""}
            onChange={handleChange}
            style={{ ...valor, width: 70 }}
          />
        </div>

        <div style={campo}>
          <span>Tipo Repliegue:</span>
          <input
            name="tipo_repliegue"
            value={formData.tipo_repliegue || ""}
            onChange={handleChange}
            style={{ ...valor, width: 70 }}
          />
        </div>

        <div style={campo}>
          <span>Senda:</span>
          <input
            name="tipo_senda"
            value={formData.tipo_senda || "ACELERADA_2026"}
            onChange={handleChange}
            style={{ ...valor, width: 130 }}
          />
        </div>

        <div style={campo}>
          <span>Fecha Abandono:</span>
          <input
            type="date"
            name="fecha_abandono"
            value={formData.fecha_abandono || ""}
            onChange={handleChange}
            style={{ ...valor, width: 120 }}
          />
        </div>


      </div>

      {/* TECNICOS Y EE.CC */}
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
          <span>Prioritaria:</span>
          <input
            type="checkbox"
            name="prioritario"
            checked={!!formData.prioritario}
            onChange={handleChange}
          />
        </div>
        
        <div style={campo}>
          <span>Proyecto Inversión:</span>
          <input
            name="proyecto_inversion"
            value={formData.proyecto_inversion || ""}
            onChange={handleChange}
            style={{ ...valor, width: 60 }}
          />
        </div>

        <div style={campo}>
          <span>Técnico Análisis:</span>
          <input
            name="tecnico_analisis"
            value={formData.tecnico_analisis || ""}
            onChange={handleChange}
            style={{ ...valor, width: 150 }}
          />
        </div>

        <div style={campo}>
          <span>Técnico Reasignaciones:</span>
          <input
            name="tecnico_reasignaciones"
            value={formData.tecnico_reasignaciones || ""}
            onChange={handleChange}
            style={{ ...valor, width: 150 }}
          />
        </div>

        <div style={campo}>
          <span>Empresa Planta Int.:</span>
          <select
            name="empresa_pi"
            value={formData.empresa_pi || ""}
            onChange={handleChange}
            style={{ ...valor, width: 150 }}
          >
            <option value="">-- Seleccionar --</option>
            {empresasPI.map((empresa) => (
              <option key={empresa.id} value={empresa.nombre}>
                {empresa.nombre}
              </option>
            ))}
          </select>
        </div>

        <div style={campo}>
          <span>Empresa Planta Ext.:</span>
          <input
            name="empresa_pe"
            value={formData.empresa_pe || ""}
            onChange={handleChange}
            style={{ ...valor, width: 150 }}
          />
        </div>

        <div style={campo}>
          <span>Empresa Recicladora:</span>
          <input
            name="empresa_recicladora"
            value={formData.empresa_recicladora || ""}
            onChange={handleChange}
            style={{ ...valor, width: 150 }}
          />
        </div>
      </div>
    </div>
  );
}
