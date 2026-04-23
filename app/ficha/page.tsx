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
  const [mostrarMemoria, setMostrarMemoria] = useState(false);
  const [memoria, setMemoria] = useState("");
  const [reasignaciones, setReasignaciones] = useState<any[]>([]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  useEffect(() => {
    if (formData) {
      setMemoria(formData.memoria || "");
    }
  }, [formData]);

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

  useEffect(() => {
    const cargarReasignaciones = async () => {
      if (!formData?.atlas) {
        setReasignaciones([]);
        return;
      }

      const { data, error } = await supabase
        .from("reasignaciones")
        .select("*")
        .eq("atlas", formData.atlas)
        .order("id", { ascending: true });

      if (error) {
        console.error("Error cargando reasignaciones:", error);
        setReasignaciones([]);
        return;
      }

      setReasignaciones(data || []);
    };

    cargarReasignaciones();
  }, [formData?.atlas]);

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
        miga: (formData.miga || "")
          .replace(/\D/g, "")
          .slice(0, 7)
          .padStart(7, "0"),
        coordenadas: formData.coordenadas,
        tipo_edificio: formData.tipo_edificio,
        tipo_repliegue: formData.tipo_repliegue,
        tipo_senda: formData.tipo_senda,
        fecha_abandono: formData.fecha_abandono,
        central_vendida: formData.central_vendida,
        prioritario: formData.prioritario,
        proyecto_inversion: formData.proyecto_inversion,
        tecnico_analisis: formData.tecnico_analisis,
        tecnico_reasignaciones: formData.tecnico_reasignaciones,
        empresa_pi: formData.empresa_pi,
        empresa_pe: formData.empresa_pe,
        empresa_recicladora: formData.empresa_recicladora,
        memoria: formData.memoria,
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
    <div style={{ padding: 20, fontFamily: "Arial", background: "#dfe3e6", minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 5,
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={guardarCambios}>💾</button>
        </div>

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
          marginBottom: 5,
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
          {formData.coordenadas && (
            <a
              href={`https://www.google.com/maps?q=${encodeURIComponent(
                formData.coordenadas
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginLeft: 6,
                textDecoration: "none",
                fontSize: 14,
              }}
            >
              🌍
            </a>
          )}
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
          <span>CCVV:</span>
          <input
            type="checkbox"
            name="central_vendida"
            checked={!!formData.central_vendida}
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
            style={{ ...valor, width: 120 }}
          />
        </div>

        <div style={campo}>
          <span>Técnico Reasignaciones:</span>
          <input
            name="tecnico_reasignaciones"
            value={formData.tecnico_reasignaciones || ""}
            onChange={handleChange}
            style={{ ...valor, width: 120 }}
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

          <button
            type="button"
            onClick={() => setMostrarMemoria(true)}
            style={{
              marginLeft: 10,
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "#f5f5f5",
              cursor: "pointer",
              padding: 0,
            }}
            title="Memoria del repliegue"
          >
            📝
          </button>

          <button
            onClick={() =>
              window.open(
                `https://spock.es.telefonica/spoc_ec/faro2/faro_detalle_nacional_repliegue.asp?central=${encodeURIComponent(
                  formData.atlas || ""
                )}`,
                "_blank"
              )
            }
            style={{
              marginLeft: 6,
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "#e8f4ff",
              cursor: "pointer",
            }}
            title="Abrir en Spock"
          >
            <img
              src="/spock.png"
              alt="Spock"
              style={{
                width: 18,
                height: 18,
                objectFit: "contain",
              }}
            />
          </button>

          {mostrarMemoria && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.4)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999,
              }}
            >
              <div
                style={{
                  background: "white",
                  padding: 20,
                  borderRadius: 8,
                  width: "500px",
                }}
              >
                <h3>Memoria del Repliegue</h3>
                <textarea
                  value={memoria}
                  onChange={(e) => setMemoria(e.target.value)}
                  style={{
                    width: "100%",
                    height: 200,
                    marginBottom: 10,
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setMostrarMemoria(false)}>
                    ❌ Cerrar
                  </button>
                  <button
                    onClick={() => {
                      setFormData((prev: any) => ({
                        ...prev,
                        memoria,
                      }));
                      setMostrarMemoria(false);
                      setCambiosSinGuardar(true);
                    }}
                  >
                    💾 Guardar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* REASIGNACIONES */}
      <div
        style={{
          marginTop: 10,
          border: "1px solid #bfc7ce",
          background: "#eef2f5",
          padding: 10,
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            marginBottom: 10,
            fontSize: 14,
          }}
        >
          Reasignaciones del atlas {formData.atlas}
        </div>

        {reasignaciones.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              padding: 10,
              fontSize: 12,
            }}
          >
            No hay reasignaciones para este atlas.
          </div>
        ) : (
          reasignaciones.map((r: any, index: number) => (
            <div
              key={r.id || index}
              style={{
                border: "1px solid #8ea9bf",
                background: "#c9e3f2",
                padding: 12,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "30px 120px 1.4fr 110px 1.5fr 2fr 90px 110px",
                  gap: 10,
                  alignItems: "start",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: 20,
                    textAlign: "center",
                    paddingTop: 20,
                  }}
                >
                  {index + 1}
                </div>

                <CampoRea label="Tipo" value={r.tipo} />
                <CampoRea label="Servicio" value={r.servicio} />
                <CampoRea label="SGIPE" value={r.sgipe} />
                <CampoRea label="Modo Reasignación" value={r.modo_reasignacion} />
                <CampoRea
                  label="Indicaciones Para el Encaminamiento"
                  value={r.indicaciones_para_el_encaminamiento}
                />
                <CampoRea label="Facturable" value={r.facturable} />
                <CampoRea
                  label="Estado Trabajos"
                  value={r.estado_trabajos}
                  color={colorEstado(r.estado_trabajos)}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 140px 140px 140px 140px 150px 130px",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <CampoRea label="Administrativo" value={r.administrativo} />
                <CampoRea label="Orden de partida" value={r.ordenes} />
                <CampoRea label="Diversificado" value={r.diversificado} />
                <CampoRea label="Tipo Diversif." value={r.tipo_diversificado} />
                <CampoRea label="Tipo Interfaz" value={r.tipo_velocidad_interface} />
                <CampoRea
                  label="Ptes Cent/Nº Ptes."
                  value={r.puentes_central_numero_de_puentes}
                />
                <CampoRea label="Fecha Ejecución" value={r.fecha_ejecucion} />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 130px 130px 110px 110px",
                  gap: 10,
                }}
              >
                <CampoRea
                  label="Observaciones Estudio Reasignación"
                  value={r.observaciones_del_estudio}
                />
                <CampoRea label="Orden Atlas" value={r.orden_atlas} />
                <CampoRea label="Estado Ord. Atlas" value={r.estado_orden_atlas} />
                <CampoRea label="UO Atlas" value={r.uo_atlas} />
                <CampoRea label="Nº Actuaciones" value={r.numero_de_actuaciones} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CampoRea({
  label,
  value,
  color = "#d9ead3",
}: {
  label: string;
  value?: string | number | null;
  color?: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: "#0b5394",
          fontWeight: "bold",
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          minHeight: 28,
          background: color,
          border: "1px solid #666",
          padding: "4px 6px",
          fontSize: 12,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {value ?? ""}
      </div>
    </div>
  );
}

function colorEstado(estado?: string | null) {
  const txt = (estado || "").toLowerCase();

  if (txt.includes("ejecut")) return "#00b0f0";
  if (txt.includes("curso")) return "#ffc000";
  if (txt.includes("pend")) return "#ffd966";

  return "#d9ead3";
}
