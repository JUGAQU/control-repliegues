"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";

const OPCIONES_MODO_REASIGNACION = [
  "NUEVO CABLE DE FIBRA A EEBB",
  "POR RADIONLACE",
  "REASIGNA TRANSPORTE",
  "REASIGNACION EN RETRANQUEO FINAL",
  "REASIGNACION EN RETRANQUEO FINAL SUPERVISADO",
  "REASIGNACION POR FTTH EN CALIENTE",
  "REASIGNACION POR FTTH EN FRIO",
  "REASIGNACION POR PUENTES ANTES DE RETRANQUEO FINAL",
  "SE MANTIENE EL RADIOENLACE APAGADO INCOMPLETO",
  "VER INDICACIONES (REQUIERE TRABAJOS EC)",
  "VER INDICACIONES (NO REQUIERE TRABAJOS EC)",
  "Pte Otras Areas",
];

const OPCIONES_ESTADO_TRABAJOS = [
  "En Análisis",
  "En Curso",
  "Incidencia en Td",
  "Ejecutada",
  "Finalizada",
  "Pte Otras Áreas",
];

const OPCIONES_TIPO_INTERFACE = [
  "MBX10D",
  "FETHEX",
  "FETHLX",
  "MBX40D",
  "MXG10D",
  "1 G",
  "PETH-1 FO",
  "PETH-2 FO",
  "1 FO",
  "2 FO",
];

export default function Ficha() {
  const [formData, setFormData] = useState<any>(null);
  const [cambiosSinGuardar, setCambiosSinGuardar] = useState(false);
  const [empresasPI, setEmpresasPI] = useState<any[]>([]);
  const [provincias, setProvincias] = useState<any[]>([]);
  const [mostrarMemoria, setMostrarMemoria] = useState(false);
  const [mostrarReasignaciones, setMostrarReasignaciones] = useState(false);
  const [mostrarPruebas, setMostrarPruebas] = useState(false);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setCambiosSinGuardar(true);
  };

  const handleReasignacionChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setReasignaciones((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const guardarReasignacion = async (r: any) => {
    if (!r?.id) return;

    const { error } = await supabase
      .from("reasignaciones")
      .update({
        modo_reasignacion: r.modo_reasignacion,
        estado_trabajos: r.estado_trabajos,
        tipo_velocidad_interface: r.tipo_velocidad_interface,
      })
      .eq("id", r.id);

    if (error) {
      console.error("Error guardando reasignación:", error);
      alert("Error al guardar la reasignación");
      return;
    }

    alert("Reasignación guardada ✅");
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
        memoria,
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

  const abrirEstudioReasignaciones = () => {
    setMostrarPruebas(false);
    setMostrarReasignaciones((prev) => !prev);
  };

  const abrirPruebas = () => {
    setMostrarReasignaciones(false);
    setMostrarPruebas((prev) => !prev);
  };

  const alturaCabecera = useMemo(() => 205, []);

  if (!formData) {
    return <div style={{ padding: 20 }}>Cargando ficha...</div>;
  }

  const campo: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 12,
    flex: "0 0 auto",
  };

  const valor: React.CSSProperties = {
    background: "#d9eef7",
    padding: "3px 6px",
    borderRadius: 4,
    border: "1px solid #bcd",
    fontSize: 12,
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "#dfe3e6",
        fontFamily: "Arial",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ZONA FIJA SUPERIOR */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: "#dfe3e6",
          padding: "20px 20px 8px 20px",
        }}
      >
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
            padding: 10,
            background: "#f5f5f5",
            display: "flex",
            flexWrap: "nowrap",
            gap: 8,
            marginBottom: 5,
            overflowX: "auto",
          }}
        >
          <div style={campo}>
            <span>Atlas:</span>
            <input
              name="atlas"
              value={formData.atlas || ""}
              readOnly
              style={{ ...valor, width: 58, background: "#eee", color: "#666" }}
            />
          </div>

          <div style={campo}>
            <span>Lote:</span>
            <input
              name="lote"
              value={formData.lote || ""}
              onChange={handleChange}
              style={{ ...valor, width: 70 }}
            />
          </div>

          <div style={campo}>
            <span>Nombre:</span>
            <input
              name="nombre"
              value={formData.nombre || ""}
              onChange={handleChange}
              style={{ ...valor, width: 150 }}
            />
          </div>

          <div style={campo}>
            <span>Provincia:</span>
            <select
              name="provincia"
              value={formData.provincia || ""}
              onChange={handleChange}
              style={{ ...valor, width: 105 }}
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
              style={{ ...valor, width: 52 }}
            />
          </div>

          <div style={campo}>
            <span>Coordenadas:</span>
            <input
              name="coordenadas"
              value={formData.coordenadas || ""}
              onChange={handleChange}
              style={{ ...valor, width: 105 }}
            />
            {formData.coordenadas && (
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(
                  formData.coordenadas
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: 4, textDecoration: "none", fontSize: 14 }}
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
              style={{ ...valor, width: 72 }}
            />
          </div>

          <div style={campo}>
            <span>Tipo Repliegue:</span>
            <input
              name="tipo_repliegue"
              value={formData.tipo_repliegue || ""}
              onChange={handleChange}
              style={{ ...valor, width: 68 }}
            />
          </div>

          <div style={campo}>
            <span>Senda:</span>
            <input
              name="tipo_senda"
              value={formData.tipo_senda || "ACELERADA_2026"}
              onChange={handleChange}
              style={{ ...valor, width: 115 }}
            />
          </div>

          <div style={campo}>
            <span>Fecha Abandono:</span>
            <input
              type="date"
              name="fecha_abandono"
              value={formData.fecha_abandono || ""}
              onChange={handleChange}
              style={{ ...valor, width: 125 }}
            />
          </div>
        </div>

        {/* TECNICOS Y EE.CC */}
        <div
          style={{
            border: "1px solid #ccc",
            padding: 10,
            background: "#f5f5f5",
            display: "flex",
            flexWrap: "nowrap",
            gap: 8,
            overflowX: "auto",
            marginBottom: 8,
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
              style={{ ...valor, width: 62 }}
            />
          </div>

          <div style={campo}>
            <span>Técnico Análisis:</span>
            <input
              name="tecnico_analisis"
              value={formData.tecnico_analisis || ""}
              onChange={handleChange}
              style={{ ...valor, width: 110 }}
            />
          </div>

          <div style={campo}>
            <span>Técnico Reasignaciones:</span>
            <input
              name="tecnico_reasignaciones"
              value={formData.tecnico_reasignaciones || ""}
              onChange={handleChange}
              style={{ ...valor, width: 110 }}
            />
          </div>

          <div style={campo}>
            <span>Empresa Planta Int.:</span>
            <select
              name="empresa_pi"
              value={formData.empresa_pi || ""}
              onChange={handleChange}
              style={{ ...valor, width: 120 }}
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
              style={{ ...valor, width: 115 }}
            />
          </div>

          <div style={campo}>
            <span>Empresa Recicladora:</span>
            <input
              name="empresa_recicladora"
              value={formData.empresa_recicladora || ""}
              onChange={handleChange}
              style={{ ...valor, width: 115 }}
            />

            <button
              type="button"
              onClick={() => setMostrarMemoria(true)}
              style={{
                marginLeft: 6,
                width: 28,
                height: 28,
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
                marginLeft: 4,
                width: 28,
                height: 28,
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
                style={{ width: 16, height: 16, objectFit: "contain" }}
              />
            </button>
          </div>
        </div>

        {/* FILA DE BOTONES */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={abrirEstudioReasignaciones}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #7f9db9",
              background: mostrarReasignaciones ? "#d9d2e9" : "#cfe2f3",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Estudio Reasignaciones
          </button>

          <button
            type="button"
            onClick={abrirPruebas}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #7f9db9",
              background: mostrarPruebas ? "#d9d2e9" : "#cfe2f3",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Pruebas
          </button>
        </div>
      </div>

      {/* ZONA INFERIOR CON SCROLL */}
      <div
        style={{
          position: "absolute",
          top: alturaCabecera,
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: "auto",
          padding: "10px 20px 20px 20px",
        }}
      >
        {mostrarReasignaciones && (
          <div
            style={{
              border: "1px solid #bfc7ce",
              background: "#eef2f5",
              padding: 10,
            }}
          >
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
                    display: "flex",
                    border: "1px solid #8ea9bf",
                    background: "#c9e3f2",
                    marginBottom: 12,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      minWidth: 42,
                      background: "#bdd7e7",
                      borderRight: "1px solid #7f9db9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#1f1f1f",
                    }}
                  >
                    {index + 1}
                  </div>

                  <div style={{ flex: 1, padding: 10 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "nowrap",
                        overflowX: "auto",
                        marginBottom: 10,
                      }}
                    >
                      <CampoSelectEstado
                        label="Estado Trabajos"
                        value={r.estado_trabajos || ""}
                        options={OPCIONES_ESTADO_TRABAJOS}
                        onChange={(value) =>
                          handleReasignacionChange(index, "estado_trabajos", value)
                        }
                      />
                      <CampoReaAuto label="Tipo" value={r.tipo} minWidth={100} />
                      <CampoReaAuto
                        label="Servicio"
                        value={r.servicio}
                        minWidth={380}
                      />
                      <CampoReaAuto
                        label="Administrativo"
                        value={r.administrativo}
                        minWidth={130}
                      />
                      <CampoReaAuto
                        label="Orden Partida"
                        value={r.ordenes}
                        minWidth={130}
                      />
                      <CampoReaAuto
                        label="Diversificado"
                        value={r.diversificado}
                        minWidth={120}
                      />
                      <CampoReaAuto
                        label="Tipo Diversificado"
                        value={r.tipo_diversificado}
                        minWidth={150}
                      />
                      <CampoSelectAuto
                        label="Tipo Interface"
                        value={r.tipo_velocidad_interface || ""}
                        options={OPCIONES_TIPO_INTERFACE}
                        minWidth={180}
                        onChange={(value) =>
                          handleReasignacionChange(
                            index,
                            "tipo_velocidad_interface",
                            value
                          )
                        }
                      />
                      <CampoReaAuto
                        label="Velocidad"
                        value={extraerVelocidad(r.tipo_velocidad_interface)}
                        minWidth={100}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "nowrap",
                        overflowX: "auto",
                        marginBottom: 10,
                        alignItems: "flex-start",
                      }}
                    >
                      <CampoSelectAuto
                        label="Modo Reasignación"
                        value={r.modo_reasignacion ?? ""}
                        options={OPCIONES_MODO_REASIGNACION}
                        minWidth={320}
                        onChange={(value) =>
                          handleReasignacionChange(
                            index,
                            "modo_reasignacion",
                            value
                          )
                        }
                      />
                      <CampoReaAuto
                        label="Indicaciones"
                        value={r.indicaciones_para_el_encaminamiento}
                        minWidth={520}
                      />
                      <CampoReaAuto
                        label="Facturable"
                        value={r.facturable}
                        minWidth={100}
                      />
                      <div style={{ paddingTop: 18 }}>
                        <button onClick={() => guardarReasignacion(r)}>💾</button>
                      </div>
                    </div>

                    <CampoRea
                      label="Observaciones Estudio Reasignación"
                      value={r.observaciones_del_estudio}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {mostrarPruebas && (
          <div
            style={{
              border: "1px solid #bfc7ce",
              background: "#eef2f5",
              padding: 10,
              minHeight: 300,
            }}
          />
        )}
      </div>

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
            zIndex: 2000,
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
              style={{ width: "100%", height: 200, marginBottom: 10 }}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setMostrarMemoria(false)}>❌ Cerrar</button>
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
  );
}

function CampoReaAuto({
  label,
  value,
  minWidth = 100,
  color = "#d9ead3",
}: {
  label: string;
  value?: string | number | null;
  minWidth?: number;
  color?: string;
}) {
  return (
    <div style={{ minWidth, flex: "0 0 auto" }}>
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
      <div
        style={{
          background: color,
          border: "1px solid #666",
          borderRadius: 4,
          padding: "4px 6px",
          minHeight: 28,
          whiteSpace: "nowrap",
          fontSize: 12,
        }}
      >
        {value ?? ""}
      </div>
    </div>
  );
}

function CampoRea({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
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
      <div
        style={{
          background: "#d9ead3",
          border: "1px solid #666",
          borderRadius: 4,
          padding: "5px 6px",
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

function CampoSelectAuto({
  label,
  value,
  options,
  minWidth = 180,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  minWidth?: number;
  onChange: (value: string) => void;
}) {
  const valorActual = value || "";
  const opcionesFinales = options.includes(valorActual)
    ? ["", ...options.filter((x) => x !== "")]
    : [valorActual, "", ...options];

  return (
    <div style={{ minWidth, flex: "0 0 auto" }}>
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
      <select
        value={valorActual}
        onChange={(e) => onChange(e.target.value)}
        style={{
          minHeight: 30,
          minWidth: "100%",
          background: "#d9ead3",
          border: "1px solid #666",
          borderRadius: 4,
          padding: "4px 6px",
          fontSize: 12,
        }}
      >
        {opcionesFinales.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
    </div>
  );
}

function CampoSelectEstado({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const valorActual = value || "";
  const opcionesFinales =
    valorActual && !options.includes(valorActual)
      ? [valorActual, ...options]
      : options;

  return (
    <div style={{ minWidth: 140, flex: "0 0 auto" }}>
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
      <select
        value={valorActual}
        onChange={(e) => onChange(e.target.value)}
        style={{
          minHeight: 30,
          width: "100%",
          background: colorEstado(valorActual),
          border: "1px solid #666",
          borderRadius: 4,
          padding: "4px 6px",
          fontSize: 12,
          fontWeight: "bold",
        }}
      >
        {opcionesFinales.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
    </div>
  );
}

function colorEstado(estado?: string | null) {
  const txt = (estado || "").toLowerCase();
  if (txt.includes("análisis")) return "#f4cccc";
  if (txt.includes("curso")) return "#ffc000";
  if (txt.includes("incidencia")) return "#ffff00";
  if (txt.includes("ejecut")) return "#00b0f0";
  if (txt.includes("final")) return "#9bbb59";
  if (txt.includes("otras")) return "#d9d2e9";
  return "#d9ead3";
}

function extraerVelocidad(texto?: string | null) {
  if (!texto) return "";
  const p = String(texto).split("/");
  return p.length > 1 ? p[1].trim() : "";
}
