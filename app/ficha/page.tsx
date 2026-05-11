"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";
import CabeceraFicha from "../components/CabeceraFicha";


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

const OPCIONES_GRUPO = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];



type BloqueActivo =
  | "equipos"
  | "reasignaciones"
  | "ejecucion_reasignaciones"
  | "visitas"
  | "certificacion"
  | null;

const COLORES = {
  fondoPantalla: "#e6e6e6",
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

type GrupoEjecucion =
  | "nuevo_cable"
  | "ftth_caliente"
  | "ftth_frio"
  | "puentes"
  | "ver_indicaciones"
  | "resto";

const GRUPOS_EJECUCION: { key: GrupoEjecucion; label: string }[] = [
  { key: "nuevo_cable", label: "Nuevo cable fibra a EEBB" },
  { key: "ftth_caliente", label: "FTTH caliente" },
  { key: "ftth_frio", label: "FTTH frío" },
  { key: "puentes", label: "Puentes antes retranqueo" },
  { key: "ver_indicaciones", label: "Ver indicaciones" },
  { key: "resto", label: "Resto" },
];

function grupoModoReasignacion(modo?: string | null): GrupoEjecucion {
  const txt = (modo || "").toUpperCase();

  if (txt.includes("NUEVO CABLE")) return "nuevo_cable";
  if (txt.includes("FTTH EN CALIENTE")) return "ftth_caliente";
  if (txt.includes("FTTH EN FRIO")) return "ftth_frio";
  if (txt.includes("PUENTES")) return "puentes";
  if (txt.includes("VER INDICACIONES")) return "ver_indicaciones";

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
  const [actuaciones, setActuaciones] = useState<any[]>([]);
  const [mostrarActuaciones, setMostrarActuaciones] = useState<Record<string, boolean>>({});
  const [bloqueActivo, setBloqueActivo] = useState<BloqueActivo>(null);
  const [filtroSgipe, setFiltroSgipe] = useState("");
  const [filtroGrupo, setFiltroGrupo] = useState("");
  const [filtrosEjecucion, setFiltrosEjecucion] =
  useState<Record<GrupoEjecucion, boolean>>({
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


  

  useEffect(() => {
  const cargarActuaciones = async () => {
    if (!formData?.atlas) {
      setActuaciones([]);
      return;
    }

    const { data, error } = await supabase
      .from("actuaciones")
      .select("*")
      .eq("atlas", formData.atlas)
      .order("id", { ascending: true });

    if (error) {
      console.error("Error cargando actuaciones:", error);
      setActuaciones([]);
      return;
    }

    console.log("ACTUACIONES CARGADAS:", data);
    setActuaciones(data || []);
  };
    

  cargarActuaciones();
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

  const handleReasignacionChangeById = (
  id: any,
  field: string,
  value: string
) => {
  setReasignaciones((prev) =>
    prev.map((item) =>
      item.id === id
        ? {
            ...item,
            [field]: value,
          }
        : item
    )
  );

  setCambiosSinGuardar(true);
};

  const handleActuacionChangeById = (
    id: any,
    field: string,
    value: any,
    base?: any
  ) => {
    setActuaciones((prev) => {
      const existe = prev.some((item) => item.id === id);
  
      if (existe) {
        return prev.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        );
      }
  
      return [
        ...prev,
        {
          ...(base || {}),
          id,
          [field]: value,
        },
      ];
    });
  
    setCambiosSinGuardar(true);
  };


const crearNuevaActuacion = (tituloGrupo: string, primero: any) => {
  const nueva = {
    id: "nuevo-" + Date.now(),
    atlas: formData.atlas,
    sgipe: primero?.sgipe || null,
    grupo: primero?.grupo || null,
    estado_actuacion: "Pendiente",
    actuacion_nocturna: false,
  };

  setActuaciones((prev) => [...prev, nueva]);

  setMostrarActuaciones((prev) => ({
    ...prev,
    [tituloGrupo]: true,
  }));

  setCambiosSinGuardar(true);
};

  const eliminarActuacion = async (act: any) => {
  const confirmar = confirm("¿Eliminar esta actuación?");
  if (!confirmar) return;

  if (String(act.id).startsWith("nuevo-")) {
    setActuaciones((prev) => prev.filter((a) => a.id !== act.id));
    setCambiosSinGuardar(true);
    return;
  }

  const { error } = await supabase
    .from("actuaciones")
    .delete()
    .eq("id", act.id);

  if (error) {
    console.error("Error eliminando actuación:", error);
    alert("Error al eliminar la actuación");
    return;
  }

  setActuaciones((prev) => prev.filter((a) => a.id !== act.id));
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
  (r: any) =>
    (r.estado_trabajos === "Ejecutada" ||
      r.estado_trabajos === "Finalizada") &&
    (!r.fecha_ejecucion || String(r.fecha_ejecucion).trim() === "")
);

if (sinFechaObligatoria.length > 0) {
  alert(
    "No puedes guardar: hay servicios en estado Ejecutada/Finalizada sin Fecha de Ejecución"
  );
  return;
}

      const reasignacionesConId = reasignaciones.filter((r) => r?.id);

      const resultados = await Promise.all(
        reasignacionesConId.map(async (r) => {
        
          
          
          const limpio = (v: any) =>
            v === "" || v === undefined ? null : v;
          
          const payload = {
            estado_trabajos: limpio(r.estado_trabajos) || "En Análisis",
            modo_reasignacion: limpio(r.modo_reasignacion),
            tipo_velocidad_interface: limpio(r.tipo_velocidad_interface),
            diversificado: limpio(r.diversificado),
            tipo_diversificado: limpio(r.tipo_diversificado),
            indicaciones_para_el_encaminamiento: limpio(r.indicaciones_para_el_encaminamiento),
            facturable: limpio(r.facturable),
            observaciones_del_estudio: limpio(r.observaciones_del_estudio),
          
            fecha_ejecucion: limpio(r.fecha_ejecucion),
            
          
            numero_de_actuaciones:
              r.numero_de_actuaciones === "" || r.numero_de_actuaciones == null
                ? null
                : Number(r.numero_de_actuaciones),
          

          
            
            geco: r.geco === true,
            cex: r.cex === true,
            rima: r.rima === true,
            redes_priv: r.redes_priv === true,
            dwdm: r.dwdm === true,
          
            ventana_geco: limpio(r.ventana_geco),
            pba_atenuacion: limpio(r.pba_atenuacion),
            autonegociacion: limpio(r.autonegociacion),
            configuracion_puerto_destino: limpio(r.configuracion_puerto_destino),
            supervisa_corte: limpio(r.supervisa_corte),
          
            sgipe: limpio(r.sgipe),
            grupo: limpio(r.grupo),
            orden_atlas: limpio(r.orden_atlas),
            estado_orden_atlas: limpio(r.estado_orden_atlas),
            uo_atlas: limpio(r.uo_atlas),
            btp: limpio(r.btp),
            fecha_btp: limpio(r.fecha_btp),
            codigo_acceso: limpio(r.codigo_acceso),
            observaciones_preparacion_reasignacion:
              limpio(r.observaciones_preparacion_reasignacion),
          };  

          

          const { error } = await supabase
            .from("reasignaciones")
            .update(payload)
            .eq("id", r.id);

          return { id: r.id, error, payload };
        })
      );

      const errores = resultados.filter((x) => x.error);

      if (errores.length > 0) {
        console.error("Errores guardando reasignaciones:", errores);
        console.error("Primer error:", errores[0]?.error);
        console.error("Payload primer error:", errores[0]?.payload);
        alert(
          `Error al guardar ${errores.length} reasignación(es). Mira la consola.`
        );
        return;
      }

    const actuacionesConDatos = actuaciones.filter((a: any) =>
      a.ec_pi ||
      a.tecnicos_necesarios ||
      a.tecnico_p_int ||
      a.telefono_p_int ||
      a.tecnico_p_ext ||
      a.telefono_p_ext ||
      a.gestor_atelco ||
      a.fecha_prevista ||
      a.estado_actuacion ||
      a.observaciones_actuacion
    );
    
    const resultadosActuaciones = await Promise.all(
      actuacionesConDatos.map(async (a: any) => {
        const payload = {
          atlas: a.atlas || formData.atlas,
          sgipe: a.sgipe || null,
          grupo: a.grupo || null,
          ec_pi: a.ec_pi || null,
          tecnicos_necesarios: a.tecnicos_necesarios || null,
          tecnico_p_int: a.tecnico_p_int || null,
          telefono_p_int: a.telefono_p_int || null,
          tecnico_p_ext: a.tecnico_p_ext || null,
          telefono_p_ext: a.telefono_p_ext || null,
          gestor_atelco: a.gestor_atelco || null,
          fecha_prevista: a.fecha_prevista || null,
          actuacion_nocturna:
            a.actuacion_nocturna === true ||
            a.actuacion_nocturna === "true" ||
            a.actuacion_nocturna === "SI",
          estado_actuacion: a.estado_actuacion || "Pendiente",
          observaciones_actuacion: a.observaciones_actuacion || null,
        };
    
        if (String(a.id).startsWith("nuevo-")) {
          const { error } = await supabase
            .from("actuaciones")
            .insert(payload);
    
          return { id: a.id, error, payload };
        }

    const { error } = await supabase
      .from("actuaciones")
      .update(payload)
      .eq("id", a.id);

    return { id: a.id, error, payload };
  })
);

const erroresActuaciones = resultadosActuaciones.filter((x) => x.error);

if (erroresActuaciones.length > 0) {
  console.error("Errores guardando actuaciones:", erroresActuaciones);
  alert(`Error al guardar ${erroresActuaciones.length} actuación(es).`);
  return;
}
      

      alert("Guardado Correctamente ✅");
      setCambiosSinGuardar(false);
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
    flexWrap: "wrap",
    overflowX: "auto",
    gap: 8,
  };

  const reasignacionesEjecucionFiltradas = reasignaciones.filter((r:any) => {
  const cumpleTipo =
    filtrosEjecucion[grupoModoReasignacion(r.modo_reasignacion)];

  const cumpleSgipe =
    filtroSgipe.trim() === "" ||
    String(r.sgipe || "")
      .toLowerCase()
      .includes(filtroSgipe.toLowerCase());

  const cumpleGrupo =
    filtroGrupo.trim() === "" ||
    String(r.grupo || "")
      .toLowerCase()
      .includes(filtroGrupo.toLowerCase());

  return cumpleTipo && cumpleSgipe && cumpleGrupo;
});

  const totalPorGrupo = (grupo: GrupoEjecucion) =>
    reasignaciones.filter(
    (r:any) => grupoModoReasignacion(r.modo_reasignacion) === grupo
  ).length;


  const serviciosAgrupados = reasignacionesEjecucionFiltradas.reduce(
  (acc:any, r:any) => {

    const clave =
      r.sgipe && String(r.sgipe).trim() !== ""
        ? "SGIPE: " + r.sgipe
        : r.grupo && String(r.grupo).trim() !== ""
          ? "Grupo: " + r.grupo
          : "Sin asignar";

    if (!acc[clave]) {
      acc[clave] = [];
    }

    acc[clave].push(r);

    return acc;

  },
  {}
);

    const gruposOrdenados = Object.entries(serviciosAgrupados).sort(
  ([a], [b]) => {
    const prioridad = (txt: string) => {
      if (txt.startsWith("SGIPE")) return 1;
      if (txt.startsWith("Grupo")) return 2;
      return 3;
    };

    return prioridad(a) - prioridad(b);
  }
);


  return (
    <div
      style={{
        height: "100vh",
        background: COLORES.fondoPantalla,
        fontFamily: "Arial",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
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

        <CabeceraFicha
          formData={formData}
          handleChange={handleChange}
          provincias={provincias}
          empresasPI={empresasPI}
          setMostrarMemoria={setMostrarMemoria}
        />


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
        </div>
      </div>

      {bloqueActivo === "ejecucion_reasignaciones" && (
        <div style={{ padding: "0 20px 8px 20px" }}>
          {/* BARRA FILTROS EJECUCIÓN */}
          
          {/* BARRA FILTROS EJECUCIÓN */}
    <div
      style={{
        display:"flex",
        gap:8,
        alignItems:"center",
        marginBottom:10,
        padding:8,
        background:"#cfe8f6",
        border:"1px solid #9fc5e8",
        overflowX:"auto"
      }}
    >
      <div
        style={{
          background:"#0070c0",
          color:"#fff",
          fontWeight:"bold",
          padding:"8px 12px",
          borderRadius:4,
          whiteSpace:"nowrap"
        }}
      >
        Ejecución Reasignaciones
      </div>

        {GRUPOS_EJECUCION.map((g)=>(
      <label
        key={g.key}
        style={{
          display:"flex",
          alignItems:"center",
          gap:5,
          border:"1px solid #7fa7c7",
          background:"#eaf5ff",
          padding:"4px 8px",
          fontSize:11,
          fontWeight:"bold",
          whiteSpace:"nowrap"
        }}
      >
        <span
          style={{
            background:"#0070c0",
            color:"#fff",
            padding:"2px 6px",
            borderRadius:3
          }}
        >
          {totalPorGrupo(g.key)}
        </span>
    
        <input
          type="checkbox"
          checked={filtrosEjecucion[g.key]}
          onChange={(e)=>
            setFiltrosEjecucion((prev)=>({
              ...prev,
              [g.key]: e.target.checked
            }))
          }
        />
    
        {g.label.toUpperCase()}
    
      </label>
    ))}
    
    {/* FILTRO SGIPE */}
    <input
      placeholder="SGIPE"
      value={filtroSgipe}
      onChange={(e)=>setFiltroSgipe(e.target.value)}
      style={{
        width:80,
        height:22,
        fontSize:11,
        padding:"1px 5px",
        border:"1px solid #7fa7c7",
        borderRadius:3
      }}
    />
    
    {/* FILTRO GRUPO */}
    <select
      value={filtroGrupo}
      onChange={(e)=>setFiltroGrupo(e.target.value)}
      style={{
        width:90,
        height:22,
        fontSize:11,
        padding:"1px 5px",
        border:"1px solid #7fa7c7",
        borderRadius:3
      }}
    >
      <option value="">Grupo</option>
      {OPCIONES_GRUPO.map((g)=>(
        <option key={g} value={g}>
          {g}
        </option>
      ))}
    </select>



      
    </div>


        </div>
      )}



      
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
                   No hay servicios para los filtros activos.
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
                            flexWrap: "wrap",
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
                            flexWrap: "wrap",
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

       {reasignacionesEjecucionFiltradas.length === 0 ? (
      <div style={{ background:"#fff", border:"1px solid #ddd", padding:10 }}>
        No hay reasignaciones para este atlas.
      </div>
    ) : (
      
      gruposOrdenados.map(([tituloGrupo, items]:any)=>( 

      <div key={tituloGrupo}>
      
      <div
        style={{
          background:"#0070c0",
          color:"#fff",
          fontWeight:"bold",
          padding:"6px 10px",
          margin:"8px 0",
          borderRadius:4
        }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span>
          {tituloGrupo} (
            {items.length} {items.length === 1 ? "Reasignación" : "Reasignaciones"}
          )
          
          
          
          
          
          
          </span>

         <button
            type="button"
            onClick={() =>
              setMostrarActuaciones((prev) => ({
                ...prev,
                [tituloGrupo]: !prev[tituloGrupo],
              }))
            }
            style={{
              background: "#7fe08a",
              border: "1px solid #6aa84f",
              color: "#215e21",
              padding: "6px 20px",
              borderRadius: 6,
              fontSize: 8,
              cursor: "pointer",
            }}
          >
            {mostrarActuaciones[tituloGrupo]
              ? "Ocultar Actuaciones"
              : "Ver Actuaciones"}
          </button>
          
        </div>
      </div>
      {mostrarActuaciones[tituloGrupo] && (() => {
        const primero: any = items[0];
      
        const actsFiltradas = actuaciones.filter((act: any) => {
          return (
            String(act.atlas || "") === String(formData.atlas || "") &&
            (
              String(act.sgipe || "") === String(primero?.sgipe || "") ||
              String(act.grupo || "") === String(primero?.grupo || "")
            )
          );
        });
      
        const actsFinal =
          actsFiltradas.length > 0
            ? actsFiltradas
            : [
                {
                  id: "nuevo-" + (primero?.sgipe || primero?.grupo || "sin"),
                  atlas: formData.atlas,
                  sgipe: primero?.sgipe || null,
                  grupo: primero?.grupo || null,
                },
              ];
      
        return actsFinal.map((act: any, index: number) => (
  <div
  key={act.id}
  style={{
    background: "#7fe08a",
    border: "1px solid #000",
    padding: 8,
    marginBottom: 10,
  }}
>

  


  
  <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>

    {/* datos actuación */}
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <div style={{ minWidth: 100, flex: "1 1 auto" }}>
  <div
    style={{
      fontSize: 11,
      fontWeight: "bold",
      color: COLORES.textoAzul,
      marginBottom: 3,
    }}
  >
    Fecha Act.
  </div>

  <input
    type="date"
    value={act.fecha_prevista || ""}
    onChange={(e) =>
      handleActuacionChangeById(
        act.id,
        "fecha_prevista",
        e.target.value,
        act
      )
    }
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

      <CampoSelectAuto
        label="Nocturna"
        value={
          act.actuacion_nocturna === true ||
          act.actuacion_nocturna === "true" ||
          act.actuacion_nocturna === 1
            ? "SI"
            : act.actuacion_nocturna === false ||
              act.actuacion_nocturna === "false" ||
              act.actuacion_nocturna === 0
            ? "NO"
            : ""
        }
        options={["SI", "NO"]}
        minWidth={50}
        onChange={(v) =>
          handleActuacionChangeById(
            act.id,
            "actuacion_nocturna",
            v === "SI"   // 👈 IMPORTANTE: boolean real
          )
        }
      />

      <CampoSelectAuto
        label="Estado actuación"
        value={act.estado_actuacion || "Pendiente"}
        options={["Pendiente", "Realizada OK", "Fallida", "Pte. Nueva Actuación"]}
        minWidth={125}
        onChange={(v) => handleActuacionChangeById(act.id, "estado_actuacion", v, act)}
      />

      <CampoInputAuto
        label="Observaciones Actuación"
        value={act.observaciones_actuacion || ""}
        minWidth={520}
        onChange={(v) => handleActuacionChangeById(act.id, "observaciones_actuacion", v, act)}
      />
    </div>


    {/* planta interior */}
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
      <CampoSelectAuto
        label="Empresa Planta Int."
        value={act.ec_pi || ""}
        options={empresasPI.map((e: any) => e.nombre)}
        minWidth={120}
        onChange={(v) => handleActuacionChangeById(act.id, "ec_pi", v, act)}
      />

      <CampoInputAuto
        label="Nº Tec."
        value={act.tecnicos_necesarios || ""}
        minWidth={50}
        onChange={(v) => handleActuacionChangeById(act.id, "tecnicos_necesarios", v, act)}
      />

      <CampoInputAuto
        label="Técnico Responsable"
        value={act.tecnico_p_int || ""}
        minWidth={150}
        onChange={(v) => handleActuacionChangeById(act.id, "tecnico_p_int", v, act)}
      />

      <CampoInputAuto
        label="Teléfono"
        value={act.telefono_p_int || ""}
        minWidth={80}
        onChange={(v) => handleActuacionChangeById(act.id, "telefono_p_int", v, act)}
      />
    </div>

    {/* planta exterior */}
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
      <CampoInputAuto
        label="Téc. Pta Ext."
        value={act.tecnico_p_ext || ""}
        minWidth={150}
        onChange={(v) => handleActuacionChangeById(act.id, "tecnico_p_ext", v, act)}
      />

      <CampoInputAuto
        label="Teléfono"
        value={act.telefono_p_ext || ""}
        minWidth={80}
        onChange={(v) => handleActuacionChangeById(act.id, "telefono_p_ext", v, act)}
      />
    </div>

   {/* atelco + papelera */}
  <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
    <CampoInputAuto
      label="Gestor Atelco"
      value={act.gestor_atelco || ""}
      minWidth={150}
      onChange={(v) => handleActuacionChangeById(act.id, "gestor_atelco", v, act)}
    />
  
   <button
  type="button"
  onClick={() => eliminarActuacion(act)}
  style={{
    background: "#f4cccc",
    border: "1px solid #cc0000",
    borderRadius: 4,
    cursor: "pointer",
    height: 20,
    padding: "0 6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
  title="Eliminar actuación"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#990000"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
</button>


    {index === actsFinal.length - 1 && (
 <button
  type="button"
  onClick={() => {
    const primero: any = items[0];
    crearNuevaActuacion(tituloGrupo, primero);
  }}
  style={{
    background: "#d9ead3",
    border: "1px solid #6aa84f",
    borderRadius: 4,
    cursor: "pointer",
    height: 20,
    padding: "0 6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
  title="Nueva actuación"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#215e21"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
</button>
)}



    
  </div>
    

    
  </div>
</div>


          
));
})()}

      {items.map((r:any,index:number)=>(

        
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
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          
            <CampoReaSoloLecturaAuto label="Tipo" value={r.tipo} minWidth={100}/>
            <CampoReaSoloLecturaAuto label="Servicio" value={r.servicio} minWidth={420}/>
            <CampoReaSoloLecturaAuto label="Modo Reasignación" value={r.modo_reasignacion} minWidth={310}/>
            <CampoReaSoloLecturaAuto label="Indicaciones Encaminamiento" value={r.indicaciones_para_el_encaminamiento} minWidth={470}/>
            <CampoInputAuto label="SGIPE" value={r.sgipe || ""} minWidth={70} onChange={(v)=>handleReasignacionChangeById(r.id,"sgipe",v)}/>
            <CampoSelectAuto
              label="Grupo"
              value={r.grupo || ""}
              options={OPCIONES_GRUPO}
              minWidth={25}
              onChange={(v)=>handleReasignacionChangeById(r.id,"grupo",v)}
            />
            
          
      
            <CampoSelectEstado
              label="Estado Trabajo"
              value={r.estado_trabajos}
              options={OPCIONES_ESTADO_TRABAJOS}
              onChange={(v)=>handleReasignacionChangeById(r.id,"estado_trabajos",v)}
            />
          
            <div style={{ minWidth:130, flex:"1 1 auto" }}>
              <div style={{fontSize:11,fontWeight:"bold",color:COLORES.textoAzul,marginBottom:3}}>
                Fecha Ejecución
              </div>
          
            <input
              type="date"
              value={r.fecha_ejecucion || ""}
              disabled={!(r.estado_trabajos === "Ejecutada" || r.estado_trabajos === "Finalizada")}
              onChange={(e) =>
                handleReasignacionChangeById(r.id, "fecha_ejecucion", e.target.value)
              }
              style={{
                width: 140,              // 👈 MÁS ancho (clave)
                minWidth: 140,           // 👈 asegura espacio
                height: 20,
                padding: "1px 5px",
                background:
                  r.estado_trabajos === "Ejecutada" || r.estado_trabajos === "Finalizada"
                    ? COLORES.fondoCampo
                    : COLORES.fondoSoloLectura,
                color:
                  r.estado_trabajos === "Ejecutada" || r.estado_trabajos === "Finalizada"
                    ? "#000"
                    : COLORES.textoSoloLectura,
                border: "1px solid #888",
                borderRadius: 4,
                fontSize: 11,
                fontFamily: "Arial",
                boxSizing: "border-box"
              }}
            />


              
            </div>
          
          </div>
          
          {/* FILA 2 */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                      
              <CampoReaSoloLecturaAuto label="Orden Partida" value={r.ordenes} minWidth={100}/>
              <CampoReaSoloLecturaAuto label="Diversificado" value={r.diversificado} minWidth={100}/>
              <CampoReaSoloLecturaAuto label="Tipo Diversificado" value={r.tipo_diversificado} minWidth={100}/>
              <CampoReaSoloLecturaAuto label="Tipo Interface" value={r.tipo_velocidad_interface} minWidth={100}/>
              <CampoReaSoloLecturaAuto label="Veloc. Interface" value={r.velocidad_interface} minWidth={60}/>
              <CampoInputAuto label="Prueba de Atenuación" value={r.pba_atenuacion || ""} minWidth={130} onChange={(v)=>handleReasignacionChangeById(r.id,"pba_atenuacion",v)}/>
              <CampoInputAuto label="Autonegociación" value={r.autonegociacion || ""} minWidth={100} onChange={(v)=>handleReasignacionChangeById(r.id,"autonegociacion",v)}/>
              <CampoInputAuto label="Configuracion Puerto Destino" value={r.configuracion_puerto_destino || ""} minWidth={170} onChange={(v)=>handleReasignacionChangeById(r.id,"configuracion_puerto_destino",v)}/>
              <div style={{ minWidth:150, flex:"1 1 auto" }}>
              <div
                style={{
                  fontSize:11,
                  fontWeight:"bold",
                  color:COLORES.textoAzul,
                  marginBottom:3
                }}
              >
                Ventana GECO
              </div>
            
              <input
                type="datetime-local"
                value={r.ventana_geco || ""}
                onChange={(e)=>
                  handleReasignacionChange(
                    index,
                    "ventana_geco",
                    e.target.value
                  )
                }
                style={{
                  width:"100%",
                  height:20,
                  padding:"1px 5px",
                  background:COLORES.fondoCampo,
                  border:"1px solid #666",
                  borderRadius:4,
                  fontSize:11,
                  boxSizing:"border-box"
                }}
              />
            </div>
              

            {/* BLOQUE CHECKS */}
            <div style={{ minWidth:330, flex:"1 1 auto" }}>
            
              {/* Etiqueta como el resto de campos */}
              <div
                style={{
                  fontSize:11,
                  fontWeight:"bold",
                  color:COLORES.textoAzul,
                  marginBottom:3
                }}
              >
                Coordinado trabajos
              </div> {/* Etiqueta como el resto de campos */}
            
              {/* Caja de checks */}
              <div
                style={{
                  display:"flex",
                  gap:10,
                  alignItems:"center",
                  background:"#d9ead3",
                  border:"1px solid #888",
                  borderRadius:4,
                  padding:"0px 8px",
                  height:20
                }}
              >
            
                <label style={{
                  display:"flex",
                  alignItems:"center",
                  gap:4,
                  fontSize:11,
                  fontWeight:"bold",
                  color:COLORES.textoAzul
                }}>
                  GECO
                  <input
                    type="checkbox"
                    checked={!!r.geco}
                    onChange={(e)=>
                      handleReasignacionChange(
                        index,
                        "geco",
                        String(e.target.checked)
                      )
                    }
                    style={{
                      transform:"scale(0.85)",
                      margin:0
                    }}
                  />
                </label>
            
                <label style={{
                  display:"flex",
                  alignItems:"center",
                  gap:4,
                  fontSize:11,
                  fontWeight:"bold",
                  color:COLORES.textoAzul
                }}>
                  CEX
                  <input
                    type="checkbox"
                    checked={!!r.cex}
                    onChange={(e)=>
                      handleReasignacionChange(
                        index,
                        "cex",
                        String(e.target.checked)
                      )
                    }
                    style={{
                      transform:"scale(0.85)",
                      margin:0
                    }}
                  />
                </label>
            
                <label style={{
                  display:"flex",
                  alignItems:"center",
                  gap:4,
                  fontSize:11,
                  fontWeight:"bold",
                  color:COLORES.textoAzul
                }}>
                  RIMA
                  <input
                    type="checkbox"
                    checked={!!r.rima}
                    onChange={(e)=>
                      handleReasignacionChange(
                        index,
                        "rima",
                        String(e.target.checked)
                      )
                    }
                    style={{
                      transform:"scale(0.85)",
                      margin:0
                    }}
                  />
                </label>
            
                <label style={{
                  display:"flex",
                  alignItems:"center",
                  gap:4,
                  fontSize:11,
                  fontWeight:"bold",
                  color:COLORES.textoAzul
                }}>
                  REDES PRIV
                  <input
                    type="checkbox"
                    checked={!!r.redes_priv}
                    onChange={(e)=>
                      handleReasignacionChange(
                        index,
                        "redes_priv",
                        String(e.target.checked)
                      )
                    }
                    style={{
                      transform:"scale(0.85)",
                      margin:0
                    }}
                  />
                </label>
            
                <label style={{
                  display:"flex",
                  alignItems:"center",
                  gap:4,
                  fontSize:11,
                  fontWeight:"bold",
                  color:COLORES.textoAzul
                }}>
                  DWDM
                  <input
                    type="checkbox"
                    checked={!!r.dwdm}
                    onChange={(e)=>
                      handleReasignacionChange(
                        index,
                        "dwdm",
                        String(e.target.checked)
                      )
                    }
                    style={{
                      transform:"scale(0.85)",
                      margin:0
                    }}
                  />
                </label>
            
              </div>  {/* Caja de checks */}
            
            </div> {/* BLOQUE CHECKS */}
              
            <CampoInputAuto label="Supervisa el Corte" value={r.supervisa_corte || ""} minWidth={300} onChange={(v)=>handleReasignacionChangeById(r.id,"supervisa_corte",v)}/>


            </div> {/* FILA 2 */}
       

            
          

            {/* FILA 3 */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
              <CampoReaSoloLecturaAuto label="Administrativo" value={r.administrativo} minWidth={130}/>
              <CampoInputAuto label="Orden Atlas" value={r.orden_atlas || ""} minWidth={120} onChange={(v)=>handleReasignacionChangeById(r.id,"orden_atlas",v)}/>
              <CampoInputAuto label="Estado Orden" value={r.estado_orden_atlas || ""} minWidth={150} onChange={(v)=>handleReasignacionChangeById(r.id,"estado_orden_atlas",v)}/>
              <CampoInputAuto label="UO Atlas" value={r.uo_atlas || ""} minWidth={100} onChange={(v)=>handleReasignacionChangeById(r.id,"uo_atlas",v)}/>
              <CampoInputAuto
                label="BTP"
                value={r.btp || ""}
                minWidth={90}
                onChange={(v)=>handleReasignacionChangeById(r.id,"btp",v)}
              />
              
              <div style={{ minWidth:130, flex:"1 1 auto" }}>
                <div style={{fontSize:11,fontWeight:"bold",color:COLORES.textoAzul,marginBottom:3}}>
                  Fecha BTP
                </div>
              
                <input
                  type="date"
                  value={r.fecha_btp || ""}
                  onChange={(e)=>handleReasignacionChangeById(r.id,"fecha_btp",e.target.value)}
                  style={{
                    width:"100%",
                    height:20,
                    padding:"1px 5px",
                    background:COLORES.fondoCampo,
                    border:"1px solid #666",
                    borderRadius:4,
                    fontSize:11,
                    boxSizing:"border-box"
                  }}
                />
              </div>
              
              <CampoInputAuto
                label="Código Acceso"
                value={r.codigo_acceso || ""}
                minWidth={120}
                onChange={(v)=>handleReasignacionChangeById(r.id,"codigo_acceso",v)}
              />



              
              <div style={{flex:1,minWidth:600}}>
                <CampoInputAuto
                  label="Observaciones Preparación"
                  value={r.observaciones_preparacion_reasignacion || ""}
                  minWidth={850}
                  onChange={(v)=>handleReasignacionChangeById(r.id,"observaciones_preparacion_reasignacion",v)}
                />
              </div>



              
            </div>
            

            

            

            
              

             
            
            


          </div>
        </div>
          ))}

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
const labelCampo: React.CSSProperties = {
  fontSize: 11,
  fontWeight: "bold",
  color: COLORES.textoAzul,
  marginBottom: 3,
};

const inputCampo: React.CSSProperties = {
  width: "100%",
  height: 20,
  padding: "1px 5px",
  background: COLORES.fondoCampo,
  border: "1px solid #666",
  borderRadius: 4,
  fontSize: 11,
  boxSizing: "border-box",
  fontFamily: "Arial",
};

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
    <div style={{ minWidth, flex: "1 1 auto" }}>
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
          overflow: "hidden",
          textOverflow: "ellipsis",
          width: "100%",

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
    <div style={{ minWidth, flex: "1 1 auto" }}>
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
    overflow: "hidden",
    textOverflow: "ellipsis",
    width: "100%",


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
    <div
      style={{
        minWidth,
        flex: "1 1 auto",
      }}
    >
      <div style={labelCampo}>{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputCampo}
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
    <div style={{ minWidth, flex: "1 1 auto" }}>
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
    <div style={{ minWidth: 140, flex: "1 1 auto" }}>
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
