"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
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
  "Incidencia en TdE",
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

type Activo =
  | "equipos"
  | "reasignaciones"
  | "ejecucion_reasignaciones"
  | "visitas"
  | "certificacion"
  | null;

const COLORES = {
  fondoPantalla: "#dfe3e6",
  fondoBloque: "#c9e3f2",
  fondoCampo: "#d9ead3",
  bordeCampo: "#93c47d",
  fondoSoloLectura: "#e6e6e6",
  textoSoloLectura: "#666666",
  fondoBoton: "#cfe2f3",
  fondoBotonActivo: "#9fc5e8",
  bordeBoton: "#6d9eeb",
  barraTitulo: "#8fb3d9",
  bordeBarraTitulo: "#6d9eeb",
  textoAzul: "#0b5394",
};



type BloqueActivo =
  | "equipos"
  | "reasignaciones"
  | "ejecucion_reasignaciones"
  | "visitas"
  | "certificacion"
  | null;

type GrupoEjecucion =
  | "nuevo_cable"
  | "ftth_caliente"
  | "ftth_frio"
  | "puentes"
  | "ver_indicaciones"
  | "resto";





const GRUPOS_EJECUCION: {
  key: GrupoEjecucion;
  label: string;
}[] = [
  { key: "nuevo_cable", label: "NUEVO CABLE FIBRA A EEBB" },
  { key: "puentes", label: "PUENTES ANTES RETRANQUEO FINAL" },
  { key: "ftth_caliente", label: "FTTH EN CALIENTE" },
  { key: "ftth_frio", label: "FTTH EN FRÍO" },
  { key: "ver_indicaciones", label: "VER INDICACIONES" },
  { key: "resto", label: "RESTO" },
];

function grupoModoReasignacion(modo?: string | null): GrupoEjecucion {
  const txt = (modo || "").toLowerCase();

  if (txt.includes("nuevo cable de fibra")) return "nuevo_cable";
  if (txt.includes("ftth en caliente")) return "ftth_caliente";
  if (txt.includes("ftth en frio") || txt.includes("ftth en frío"))
    return "ftth_frio";
  if (txt.includes("puentes antes")) return "puentes";
  if (txt.includes("ver indicaciones")) return "ver_indicaciones";

  return "resto";
}
















export default function Ficha() {
  const [formData, setFormData] = useState<any>(null);
  const [cambiosSinGuardar, setCambiosSinGuardar] = useState(false);
  const [empresasPI, setEmpresasPI] = useState<any[]>([]);
  const [provincias, setProvincias] = useState<any[]>([]);
  const [mostrarMemoria, setMostrarMemoria] = useState(false);
  const [memoria, setMemoria] = useState("");
  const [reasignaciones, setReasignaciones] = useState<any[]>([]);
  const [bloqueActivo, setBloqueActivo] = useState<BloqueActivo>(null);
const [filtrosEjecucion, setFiltrosEjecucion] = useState<
  Record<GrupoEjecucion, boolean>
>({
  nuevo_cable: true,
  ftth_caliente: true,
  ftth_frio: true,
  puentes: true,
  ver_indicaciones: true,
  resto: true,
});

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

      const normalizadas = (data || []).map((r: any) => ({
        ...r,
        estado_trabajos:
          r.estado_trabajos && String(r.estado_trabajos).trim() !== ""
            ? r.estado_trabajos
            : "En Análisis",
      }));

      setReasignaciones(normalizadas);
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

    setCambiosSinGuardar(true);
  };

  const guardarCambios = async () => {
    if (!formData?.id) {
      alert("Error: no hay ID");
      return;
    }

    try {
      const { error: errorFicha } = await supabase
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

      if (errorFicha) {
        console.error("Error guardando ficha:", errorFicha);
        alert("Error al guardar la ficha");
        return;
      }

      const sinFechaObligatoria = reasignaciones.filter(
      (r:any)=>
      (
      r.estado_trabajos==="Ejecutada" ||
      r.estado_trabajos==="Finalizada"
      )
     


        
      &&
      (!r.fecha_ejecucion || String(r.fecha_ejecucion).trim()==="")
      );

      if(sinFechaObligatoria.length>0){
      alert(
      "No puedes guardar: hay servicios en estado Ejecutada/Finalizada sin Fecha de Ejecución"
      );
      return;
      }

      const reasignacionesConId = reasignaciones.filter((r) => r?.id);

      const resultados = await Promise.all(
        reasignacionesConId.map(async (r) => {
          const payload = {
            estado_trabajos:
              r.estado_trabajos && String(r.estado_trabajos).trim() !== ""
                ? r.estado_trabajos
                : "En Análisis",
            modo_reasignacion:
              r.modo_reasignacion && String(r.modo_reasignacion).trim() !== ""
                ? r.modo_reasignacion
                : null,
            tipo_velocidad_interface:
              r.tipo_velocidad_interface &&
              String(r.tipo_velocidad_interface).trim() !== ""
                ? r.tipo_velocidad_interface
                : null,
            diversificado:
              r.diversificado && String(r.diversificado).trim() !== ""
                ? r.diversificado
                : null,
            tipo_diversificado:
              r.tipo_diversificado &&
              String(r.tipo_diversificado).trim() !== ""
                ? r.tipo_diversificado
                : null,
            indicaciones_para_el_encaminamiento:
              r.indicaciones_para_el_encaminamiento &&
              String(r.indicaciones_para_el_encaminamiento).trim() !== ""
                ? r.indicaciones_para_el_encaminamiento
                : null,
            facturable:
              r.facturable && String(r.facturable).trim() !== ""
                ? r.facturable
                : null,
            observaciones_del_estudio:
              r.observaciones_del_estudio &&
              String(r.observaciones_del_estudio).trim() !== ""
                ? r.observaciones_del_estudio
                : null,

            fecha_ejecucion: r.fecha_ejecucion || null,
numero_de_actuaciones: r.numero_de_actuaciones || null,

geco: !!r.geco,
cex: !!r.cex,
rima: !!r.rima,
redes_priv: !!r.redes_priv,
dwdm: !!r.dwdm,

ventana_geco: r.ventana_geco || null,

cuestionario: r.cuestionario || null,
pba_atenuacion: r.pba_atenuacion || null,
autonegociacion: r.autonegociacion || null,
configuracion_puerto_destino:
  r.configuracion_puerto_destino || null,
supervisa_corte: r.supervisa_corte || null,

sgipe: r.sgipe || null,
grupo: r.grupo || null,

orden_atlas: r.orden_atlas || null,
estado_orden_atlas: r.estado_orden_atlas || null,
uo_atlas: r.uo_atlas || null,

observaciones_preparacion_reasignacion:
  r.observaciones_preparacion_reasignacion || null,
          };

const { data, error } = await supabase
  .from("reasignaciones")
  .update(payload)
  .eq("id", r.id)
  .select("id");

console.log("Resultado Guardando reasignación:", {
  id: r.id,
  payload,
  data,
  error,
});

return { id: r.id, data, error, payload };
        })
      );

const errores = resultados.filter((x) => x.error);

      if (errores.length > 0) {
        console.error("Errores guardando reasignaciones:", errores);
        alert(
          `Error al guardar ${errores.length} reasignación(es). Mira la consola.`
        );
        return;
      }

      alert("Guardado completo en Supabase ✅");
      setCambiosSinGuardar(false);
      router.replace("/listado");
      router.refresh();
    } catch (e) {
      console.error("Error inesperado al guardar:", e);
      alert("Error inesperado al guardar");
    }
  };

  
  const toggleBloque = (bloque: Exclude<BloqueActivo, null>) => {
    setBloqueActivo((prev) => (prev === bloque ? null : bloque));
  };

  const getTituloBloque = () => {
    switch (bloqueActivo) {
      case "equipos":
        return "Equipos";
      case "reasignaciones":
        return "Estudio Reasignaciones";
      case "ejecucion_reasignaciones":
        return "Ejecución Reasignaciones";
      case "visitas":
        return "Visitas";
      case "certificacion":
        return "Certificación";
      default:
        return "";
    }
  };

  if (!formData) {
    return <div style={{ padding: 20 }}>Cargando ficha...</div>;
  }

  const campo: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 12,
    fontWeight: "bold",
    color: COLORES.textoAzul,
    flex: "0 0 auto",
    fontFamily: "Arial",
  };

  const valor: React.CSSProperties = {
    background: COLORES.fondoCampo,
    padding: "1px 5px",
    height: 20,
    borderRadius: 4,
    border: `1px solid ${COLORES.bordeCampo}`,
    fontSize: 11,
    boxSizing: "border-box",
    fontFamily: "Arial",
  };

  const bloqueSuperior: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #b7c6d0",
    padding: "12px 10px",
    background: COLORES.fondoBloque,
    display: "flex",
    flexWrap: "nowrap",
    overflowX: "auto",
    gap: 8,
  };

  const resumenEjecucion = GRUPOS_EJECUCION.reduce(
    (acc, grupo) => {
      acc[grupo.key] = reasignaciones.filter(
        (r: any) => grupoModoReasignacion(r.modo_reasignacion) === grupo.key
      ).length;
      return acc;
    },
    {} as Record<GrupoEjecucion, number>
  );

  const reasignacionesEjecucionFiltradas = reasignaciones.filter((r: any) => {
    const grupo = grupoModoReasignacion(r.modo_reasignacion);
    return filtrosEjecucion[grupo];
  });


  

  return (
    <div
      style={{
        height: "100vh",
        background: COLORES.fondoPantalla,
        fontFamily: "Arial",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: "0 0 auto",
          padding: "10px 20px 0 20px",
          background: COLORES.fondoPantalla,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-start", gap: 10 }}>
            <button onClick={guardarCambios}>💾</button>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <img
              src="/logogris.png"
              alt="Logo"
              style={{ height: 28, objectFit: "contain" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
        </div>

        <div style={{ ...bloqueSuperior, marginBottom: 5 }}>
          <div style={campo}>
            <span>Atlas:</span>
            <input
              name="atlas"
              value={formData.atlas || ""}
              readOnly
              style={{
                ...valor,
                width: 58,
                background: "#eee",
                color: "#666",
                border: "1px solid #999",
              }}
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
              style={{ ...valor, width: 115 }}
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
              style={{ ...valor, width: 80 }}
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

        <div style={{ ...bloqueSuperior, marginBottom: 8 }}>
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
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6,
                border: "1px solid #ccc",
                background: "#f5f5f5",
                cursor: "pointer",
                padding: 0,
                fontSize: 11,
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
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6,
                border: "1px solid #ccc",
                background: "#e8f4ff",
                cursor: "pointer",
                padding: 0,
              }}
              title="Abrir en Spock"
            >
              <img
                src="/spock.png"
                alt="Spock"
                style={{ width: 14, height: 14, objectFit: "contain" }}
              />
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            gap: 8,
            width: "100%",
            boxSizing: "border-box",
            marginBottom: 8,
          }}
        >
          <BotonBloque
            texto="Equipos"
            activo={bloqueActivo === "equipos"}
            onClick={() => toggleBloque("equipos")}
          />
          <BotonBloque
            texto="Estudio Reasignaciones"
            activo={bloqueActivo === "reasignaciones"}
            onClick={() => toggleBloque("reasignaciones")}
          />
          <BotonBloque
            texto="Ejecución Reasignaciones"
            activo={bloqueActivo === "ejecucion_reasignaciones"}
            onClick={() => toggleBloque("ejecucion_reasignaciones")}
          />
          <BotonBloque
            texto="Visitas"
            activo={bloqueActivo === "visitas"}
            onClick={() => toggleBloque("visitas")}
          />
          <BotonBloque
            texto="Certificación"
            activo={bloqueActivo === "certificacion"}
            onClick={() => toggleBloque("certificacion")}
          />
        </div>


       

        {/* BLOQUE 3 */}

        
        <div
          style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #b7c6d0",
            background: COLORES.fondoBloque,
            padding: 10,
            marginBottom: 8,
          }}
        >
          {bloqueActivo === "ejecucion_reasignaciones" ? (
            <div
              style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  background: "#0070c0",
                  color: "white",
                  fontWeight: "bold",
                  padding: "4px 12px",
                  borderRadius: 4,
                  whiteSpace: "nowrap",
                }}
              >
                Ejecución Reasignaciones
              </div>
              <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "#d9ead3",
    border: "1px solid #6aa84f",
    padding: "4px 8px",
    fontSize: 11,
    fontWeight: "bold",
    whiteSpace: "nowrap",
  }}
>
  <span
    style={{
      background: "#38761d",
      color: "white",
      padding: "2px 6px",
      borderRadius: 3,
    }}
  >
    {reasignaciones.length}
  </span>

  <span>TOTAL REASIGNACIONES</span>
</div>

              {GRUPOS_EJECUCION.map((grupo) => (
                <label
                  key={grupo.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    background: "#eaf4ff",
                    border: "1px solid #7ea1be",
                    padding: "4px 8px",
                    fontSize: 11,
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      background: "#0070c0",
                      color: "white",
                      padding: "2px 6px",
                      borderRadius: 3,
                    }}
                  >
                    {resumenEjecucion[grupo.key] || 0}
                  </span>

                  <input
                    type="checkbox"
                    checked={filtrosEjecucion[grupo.key]}
                    onChange={(e) =>
                      setFiltrosEjecucion((prev) => ({
                        ...prev,
                        [grupo.key]: e.target.checked,
                      }))
                    }
                  />

                  <span>{grupo.label}</span>
                </label>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "6px 10px",
                background: COLORES.barraTitulo,
                border: `1px solid ${COLORES.bordeBarraTitulo}`,
                borderRadius: 6,
                fontWeight: "bold",
                fontSize: 12,
                color: "#083b73",
                minHeight: 20,
                boxSizing: "border-box",
              }}
            >
              {bloqueActivo ? getTituloBloque() : "Ningún bloque seleccionado"}
            </div>
          )}
        </div>
      </div>


{/* BLOQUE 4 */}

      
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          padding: "0 20px 20px 20px",
          boxSizing: "border-box",
        }}
      >
        {bloqueActivo && (
          <div
            style={{
              width: "100%",
              boxSizing: "border-box",
              border: "1px solid #b7c6d0",
              background: COLORES.fondoBloque,
              padding: 10,
              fontFamily: "Arial",
              fontSize: 11,
            }}
          >
            {bloqueActivo === "equipos" && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  minHeight: 260,
                }}
              />
            )}

            {bloqueActivo === "reasignaciones" && (
              <>
                {reasignaciones.length === 0 ? (
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #ddd",
                      padding: 10,
                      fontSize: 11,
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
                        background: COLORES.fondoBloque,
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
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#1f1f1f",
                        }}
                      >
                        {index + 1}
                      </div>

                      <div style={{ flex: 1, padding: 8 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            flexWrap: "nowrap",
                            overflowX: "auto",
                            marginBottom: 8,
                          }}
                        >
                          <CampoSelectEstado
                            label="Estado Trabajos"
                            value={r.estado_trabajos}
                            options={OPCIONES_ESTADO_TRABAJOS}
                            onChange={(value) =>
                              handleReasignacionChange(
                                index,
                                "estado_trabajos",
                                value
                              )
                            }
                          />

                          <CampoReaSoloLecturaAuto
                            label="Tipo"
                            value={r.tipo}
                            minWidth={100}
                          />

                          <CampoReaSoloLecturaAuto
                            label="Servicio"
                            value={r.servicio}
                            minWidth={380}
                          />

                          <CampoReaSoloLecturaAuto
                            label="Administrativo"
                            value={r.administrativo}
                            minWidth={130}
                          />

                          <CampoReaSoloLecturaAuto
                          label="Modo Reasignación"
                          value={r.modo_reasignacion}
                          minWidth={320}
                          />

                          <CampoReaSoloLecturaAuto
                          label="Indicaciones Encaminamiento"
                          value={r.indicaciones_para_el_encaminamiento}
                          minWidth={520}
                          />




                          

                          <CampoReaSoloLecturaAuto
                            label="Orden Partida"
                            value={r.ordenes}
                            minWidth={130}
                          />

                          <CampoInputAuto
                            label="Diversificado"
                            value={r.diversificado || ""}
                            minWidth={120}
                            onChange={(value) =>
                              handleReasignacionChange(
                                index,
                                "diversificado",
                                value
                              )
                            }
                          />

                          <CampoInputAuto
                            label="Tipo Diversificado"
                            value={r.tipo_diversificado || ""}
                            minWidth={150}
                            onChange={(value) =>
                              handleReasignacionChange(
                                index,
                                "tipo_diversificado",
                                value
                              )
                            }
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
                            marginBottom: 8,
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

                          <CampoInputAuto
                            label="Indicaciones"
                            value={r.indicaciones_para_el_encaminamiento || ""}
                            minWidth={520}
                            onChange={(value) =>
                              handleReasignacionChange(
                                index,
                                "indicaciones_para_el_encaminamiento",
                                value
                              )
                            }
                          />

                          <CampoInputAuto
                            label="Facturable"
                            value={r.facturable || ""}
                            minWidth={100}
                            onChange={(value) =>
                              handleReasignacionChange(index, "facturable", value)
                            }
                          />
                        </div>

                        <CampoInputAuto
                          label="Observaciones Estudio Reasignación"
                          value={r.observaciones_del_estudio || ""}
                          minWidth={700}
                          onChange={(value) =>
                            handleReasignacionChange(
                              index,
                              "observaciones_del_estudio",
                              value
                            )
                          }
                        />
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

{bloqueActivo === "ejecucion_reasignaciones" && (
<>
{reasignacionesEjecucionFiltradas.length===0 ? (

<div
style={{
background:"#fff",
border:"1px solid #ddd",
padding:10,
fontSize:11
}}
>
No hay servicios para los filtros activos
</div>

) : (

reasignacionesEjecucionFiltradas.map(
(r:any,index:number)=>(

<div
key={r.id || index}
style={{
display:"flex",
border:"1px solid #8ea9bf",
background:"#d9edf7",
marginBottom:12
}}
>

<div
style={{
width:35,
background:"#bdd7e7",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontWeight:"bold",
fontSize:18
}}
>
{index+1}
</div>

<div style={{flex:1,padding:6}}>

{/* FILA 1 */}
<div
style={{
display:"flex",
gap:8,
overflowX:"auto",
marginBottom:6
}}
>

<CampoReaSoloLecturaAuto
label="Tipo"
value={r.tipo}
minWidth={100}
/>

<CampoReaSoloLecturaAuto
label="Servicio"
value={r.servicio}
minWidth={420}
/>

<CampoReaSoloLecturaAuto
label="Administrativo"
value={r.administrativo}
minWidth={130}
/>

<CampoReaSoloLecturaAuto
label="Modo Reasignación"
value={r.modo_reasignacion}
minWidth={260}
/>

<CampoReaSoloLecturaAuto
label="Indicaciones Encaminamiento"
value={r.indicaciones_para_el_encaminamiento}
minWidth={420}
/>

<CampoInputAuto
label="SGIPE"
value={r.sgipe || ""}
minWidth={90}
onChange={(v)=>
handleReasignacionChange(
reasignaciones.findIndex(x=>x.id===r.id),
"sgipe",
v
)}
/>

<CampoInputAuto
label="Grupo"
value={r.grupo || ""}
minWidth={70}
onChange={(v)=>
handleReasignacionChange(
reasignaciones.findIndex(x=>x.id===r.id),
"grupo",
v
)}
/>

</div>

{/* FILA 2 */}

<div
style={{
display:"flex",
gap:8,
overflowX:"auto",
marginBottom:6
}}
>

<CampoInputAuto
label="Cuestionario"
value={r.cuestionario || ""}
minWidth={100}
onChange={(v)=>
handleReasignacionChange(
reasignaciones.findIndex(x=>x.id===r.id),
"cuestionario",
v
)}
/>









</div>


{/* FILA 3 */}

<div
style={{
display:"flex",
gap:8,
overflowX:"auto"
}}
>

<CampoInputAuto
label="Orden Atlas"
value={r.orden_atlas || ""}
minWidth={120}
onChange={(v)=>
handleReasignacionChange(
reasignaciones.findIndex(x=>x.id===r.id),
"orden_atlas",
v
)}
/>

<CampoInputAuto
label="Estado Orden"
value={r.estado_orden_atlas || ""}
minWidth={150}
onChange={(v)=>
handleReasignacionChange(
reasignaciones.findIndex(x=>x.id===r.id),
"estado_orden_atlas",
v
)}
/>

<CampoInputAuto
label="UO Atlas"
value={r.uo_atlas || ""}
minWidth={100}
onChange={(v)=>
handleReasignacionChange(
reasignaciones.findIndex(x=>x.id===r.id),
"uo_atlas",
v
)}
/>

<CampoInputAuto
label="Obs Preparación"
value={
r.observaciones_preparacion_reasignacion || ""
}
minWidth={420}
onChange={(v)=>
handleReasignacionChange(
reasignaciones.findIndex(x=>x.id===r.id),
"observaciones_preparacion_reasignacion",
v
)}
/>

</div> {/* FIN FILA 3 */}

{/* FILA 4 */}

<CampoInputAuto
label="Pba Atenuación"
value={r.pba_atenuacion || ""}
minWidth={110}
onChange={(v)=>
handleReasignacionChange(
reasignaciones.findIndex(x=>x.id===r.id),
"pba_atenuacion",
v
)}
/>

<CampoInputAuto
label="Autonegociación"
value={r.autonegociacion || ""}
minWidth={120}
onChange={(v)=>
handleReasignacionChange(
reasignaciones.findIndex(x=>x.id===r.id),
"autonegociacion",
v
)}
/>

<CampoInputAuto
label="Config Puerto"
value={r.configuracion_puerto_destino || ""}
minWidth={150}
onChange={(v)=>
handleReasignacionChange(
reasignaciones.findIndex(x=>x.id===r.id),
"configuracion_puerto_destino",
v
)}
/>

<div
style={{
display:"flex",
gap:8,
overflowX:"auto",
marginTop:6
}}
>

<CampoSelectEstado
label="Estado Trabajo"
value={r.estado_trabajos}
options={OPCIONES_ESTADO_TRABAJOS}
onChange={(v)=>
handleReasignacionChange(
reasignaciones.findIndex(x=>x.id===r.id),
"estado_trabajos",
v
)}
/>

<div style={{ minWidth:130, flex:"0 0 auto" }}>
<div
style={{
fontSize:11,
fontWeight:"bold",
color:COLORES.textoAzul,
marginBottom:3
}}
>
F. Ejecución
</div>

<input
type="date"
value={r.fecha_ejecucion || ""}

disabled={
!(
r.estado_trabajos==="Ejecutada" ||
r.estado_trabajos==="Finalizada"
)
}

onChange={(e)=>
handleReasignacionChange(
reasignaciones.findIndex(x=>x.id===r.id),
"fecha_ejecucion",
e.target.value
)
}

style={{
width:"100%",
height:20,
padding:"1px 5px",

background:
(
r.estado_trabajos==="Ejecutada" ||
r.estado_trabajos==="Finalizada"
)
? COLORES.fondoCampo
: COLORES.fondoSoloLectura,

color:
(
r.estado_trabajos==="Ejecutada" ||
r.estado_trabajos==="Finalizada"
)
? "#000"
: COLORES.textoSoloLectura,

border:"1px solid #888",
borderRadius:4,
fontSize:11,
fontFamily:"Arial",
boxSizing:"border-box"
}}
/>

</div>

</div> {/* FIN FILA 4 */}


  

</div>

</div>

))
)}
  
</>
)}


  

            {bloqueActivo === "visitas" && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  minHeight: 260,
                }}
              />
            )}

            {bloqueActivo === "certificacion" && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  minHeight: 260,
                }}
              />
            )}
          </div>
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

function BotonBloque({
  texto,
  activo,
  onClick,
}: {
  texto: string;
  activo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 12px",
        borderRadius: 6,
        border: `1px solid ${COLORES.bordeBoton}`,
        background: activo ? COLORES.fondoBotonActivo : COLORES.fondoBoton,
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: 11,
        fontFamily: "Arial",
      }}
    >
      {texto}
    </button>
  );
}

function CampoReaAuto({
  label,
  value,
  minWidth = 100,
  color = COLORES.fondoCampo,
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
          color: COLORES.textoAzul,
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
          padding: "1px 5px",
          minHeight: 20,
          fontSize: 11,
          fontFamily: "Arial",
          boxSizing: "border-box",
          whiteSpace: "nowrap",
        }}
      >
        {value ?? ""}
      </div>
    </div>
  );
}

function CampoReaSoloLecturaAuto({
  label,
  value,
  minWidth = 100,
}: {
  label: string;
  value?: string | number | null;
  minWidth?: number;
}) {
  return (
    <div style={{ minWidth, flex: "0 0 auto" }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: "bold",
          color: COLORES.textoAzul,
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          background: COLORES.fondoSoloLectura,
          color: COLORES.textoSoloLectura,
          border: "1px solid #888",
          borderRadius: 4,
          padding: "1px 5px",
          minHeight: 20,
          fontSize: 11,
          fontFamily: "Arial",
          boxSizing: "border-box",
          whiteSpace: "nowrap",
        }}
      >
        {value ?? ""}
      </div>
    </div>
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
    <div style={{ minWidth, flex: "0 0 auto" }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: "bold",
          color: COLORES.textoAzul,
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
          background: COLORES.fondoCampo,
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
          color: COLORES.textoAzul,
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <select
        value={valorActual}
        onChange={(e) => onChange(e.target.value)}
        style={{
          minWidth: "100%",
          height: 20,
          padding: "1px 5px",
          background: COLORES.fondoCampo,
          border: "1px solid #666",
          borderRadius: 4,
          fontSize: 11,
          fontFamily: "Arial",
          boxSizing: "border-box",
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
  const valorActual = value && value.trim() !== "" ? value : "En Análisis";
  const opcionesFinales =
    options.includes(valorActual) ? options : [valorActual, ...options];

  return (
    <div style={{ minWidth: 140, flex: "0 0 auto" }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: "bold",
          color: COLORES.textoAzul,
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <select
        value={valorActual}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          height: 20,
          padding: "1px 5px",
          background: colorEstado(valorActual),
          border: "1px solid #666",
          borderRadius: 4,
          fontSize: 11,
          fontFamily: "Arial",
          fontWeight: "bold",
          boxSizing: "border-box",
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

  if (txt.includes("análisis") || txt.includes("analisis")) return "#f4cccc";
  if (txt.includes("curso")) return "#ffc000";
  if (txt.includes("incidencia")) return "#fff200";
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
