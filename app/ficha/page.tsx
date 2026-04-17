"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { datos as datosIniciales } from "../data";

export default function Ficha() {
  const [formData, setFormData] = useState<any>({});
  const [datos, setDatos] = useState<any[]>([]); // 👈 AÑADIDO
  const [cambiosSinGuardar, setCambiosSinGuardar] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  // 🔄 CARGAR DATOS DESDE LOCALSTORAGE
  useEffect(() => {
    const guardados = localStorage.getItem("datos");

    if (guardados) {
      setDatos(JSON.parse(guardados));
    } else {
      setDatos(datosIniciales);
    }
  }, []);

  // 🔄 CARGAR REGISTRO EN FICHA
  useEffect(() => {
    if (id !== null && datos.length > 0) {
      setFormData(datos[parseInt(id)]);
    }
  }, [id, datos]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setCambiosSinGuardar(true);
  };

  // 💾 GUARDAR CAMBIOS
  const guardarCambios = () => {
    if (id === null) return;

    const nuevosDatos = [...datos];

    nuevosDatos[parseInt(id)] = {
      ...formData,
      atlas: datos[parseInt(id)].atlas, // 🔒 NO MODIFICAR ATLAS
    };

    setDatos(nuevosDatos);
    localStorage.setItem("datos", JSON.stringify(nuevosDatos));

    alert("Guardado correctamente");
    setCambiosSinGuardar(false);
  };

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



{/* GUARDAR (DISCO) */}
<button
  onClick={guardarCambios}
  title="Guardar"
  style={{
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 18,
  }}
>
  💾
</button>

{/* VOLVER */}
<button
onClick={() => {
  if (cambiosSinGuardar) {
    const confirmar = confirm("Tienes cambios sin guardar. ¿Salir sin guardar?");
    if (!confirmar) return;
  }
  router.back();
}}
title="Cerrar"
style={{
  background: "#eee",
  border: "1px solid #ccc",
  padding: "6px 10px",
  cursor: "pointer",
  fontSize: 16,
}}
>
✖
</button>

</div>

      {/* DATOS PRINCIPALES */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: 15,
          marginBottom: 20,
          background: "#f5f5f5",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 15,
            alignItems: "center",
          }}
        >

          <div style={campo}>
            <span>Atlas:</span>
            <input
              name="atlas"
              value={formData.atlas || ""}
              readOnly
              style={{
                ...valor,
                width: 70,
                background: "#eee",
                color: "#666",
                cursor: "not-allowed",
              }}
            />
          </div>

          <div style={campo}>
            <span>Lote:</span>
            <input
              name="lote"
              value={formData.lote || ""}
              onChange={handleChange}
              style={{ ...valor, width: 100 }}
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
            <input
              name="provincia"
              value={formData.provincia || ""}
              onChange={handleChange}
              style={{ ...valor, width: 90 }}
            />
          </div>

          <div style={campo}>
            <span>Miga:</span>
            <input
              name="miga"
              value={formData.miga || ""}
              onChange={handleChange}
              style={{ ...valor, width: 70 }}
            />
          </div>

          <div style={campo}>
            <span>Coordenadas:</span>
            <input
              name="coordenadas"
              value={formData.coordenadas || ""}
              onChange={handleChange}
              style={{ ...valor, width: 130 }}
            />
          </div>

          <div style={campo}>
            <span>Tipo Edificio:</span>
            <input
              name="tipo_edificio"
              value={formData.tipo_edificio || ""}
              onChange={handleChange}
              style={{ ...valor, width: 60 }}
            />
          </div>

          <div style={campo}>
            <span>Tipo Repliegue:</span>
            <input
              name="tipo_repliegue"
              value={formData.tipo_repliegue || ""}
              onChange={handleChange}
              style={{ ...valor, width: 80 }}
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
              name="fecha_abandono"
              value={formData.fecha_abandono || ""}
              onChange={handleChange}
              style={{ ...valor, width: 80 }}
            />
          </div>

          <div style={campo}>
            <span>Prioritario:</span>
            <input
              type="checkbox"
              name="prioritario"
              checked={formData.prioritario || false}
              onChange={handleChange}
            />
          </div>

        </div>
      </div>

      {/* BOTÓN */}


    </div>
  );
}