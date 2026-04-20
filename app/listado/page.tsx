"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

// 🔒 función segura
const safe = (v: any) => (v ?? "").toString().toLowerCase();

export default function Listado() {
  const router = useRouter();

  const [datos, setDatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // 🔐 PROTECCIÓN LOGIN
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/");
      } else {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // 🚀 CGA DATOS
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await fetch("/api/fichas");
        const data = await res.json();

        console.log("DATOS API:", data);

        if (Array.isArray(data)) {
          setDatos(data);
        } else {
          console.error("La API no devuelve array:", data);
          setDatos([]);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarDatos();
  }, []);

  // 🔍 FILTROS
  const [filtros, setFiltros] = useState({
    atlas: "",
    lote: "",
    nombre: "",
    provincia: "",
    miga: "",
    coordenadas: "",
    tipo_edificio: "",
    tipo_repliegue: "",
    tipo_senda: "",
    fecha_abandono: "",
    prioritario: "",
  });

  // 🔼 ORDEN
  const [orden, setOrden] = useState({
  campo: "",
  direccion: "asc",
});

const ordenar = (campo: string) => {
  let direccion: "asc" | "desc" = "asc";

  if (orden.campo === campo && orden.direccion === "asc") {
    direccion = "desc";
  }

  setOrden({ campo, direccion });
};

  // 🔍 FILTRADO + ORDEN
  const datosFiltrados = datos
    .filter((item) => {
      if (!item) return false; // 🔥 evita errores

      return (
        safe(item.atlas).includes(safe(filtros.atlas)) &&
        safe(item.lote).includes(safe(filtros.lote)) &&
        safe(item.nombre).includes(safe(filtros.nombre)) &&
        safe(item.provincia).includes(safe(filtros.provincia)) &&
        safe(item.miga).includes(safe(filtros.miga)) &&
        safe(item.coordenadas).includes(safe(filtros.coordenadas)) &&
        safe(item.tipo_edificio).includes(safe(filtros.tipo_edificio)) &&
        safe(item.tipo_repliegue).includes(safe(filtros.tipo_repliegue)) &&
        safe(item.tipo_senda || "ACELERADA_2026").includes(safe(filtros.tipo_senda)) &&
        safe(item.fecha_abandono).includes(safe(filtros.fecha_abandono)) &&
        (item.prioritario ? "si" : "no").includes(safe(filtros.prioritario))
      );
    })
    .sort((a: any, b: any) => {
      if (!orden.campo) return 0;

      const valorA = safe(a[orden.campo]);
      const valorB = safe(b[orden.campo]);

      if (valorA < valorB) return orden.direccion === "asc" ? -1 : 1;
      if (valorA > valorB) return orden.direccion === "asc" ? 1 : -1;
      return 0;
    });

  // 🛑 BLOQUEOS DE RENDER
  if (loading) return null;

  if (cargandoDatos) {
    return <div style={{ padding: 20 }}>Cargando datos...</div>;
  }

  return (
    <div style={{ padding: 10, fontSize: 12 }}>
      <div style={{ overflowX: "auto", maxHeight: "500px" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            tableLayout: "fixed",
          }}
        >
          <thead
            style={{
              position: "sticky",
              top: 0,
              background: "#ddd",
              zIndex: 1,
            }}
          >
            {/* 🔍 FILTROS */}
            <tr>
              {Object.keys(filtros).map((campo) => (
                <th key={campo} style={th}>
                  <input
                    onChange={(e) =>
                      setFiltros({
                        ...filtros,
                        [campo]: e.target.value,
                      })
                    }
                    style={inputFiltro}
                  />
                </th>
              ))}
            </tr>

            {/* 🧾 CABECERA */}
            <tr style={{ background: "#ddd" }}>
              <th style={th} onClick={() => ordenar("atlas")}>Atlas</th>
              <th style={th} onClick={() => ordenar("lote")}>Lote</th>
              <th style={th} onClick={() => ordenar("nombre")}>Nombre</th>
              <th style={th} onClick={() => ordenar("provincia")}>Provincia</th>
              <th style={th} onClick={() => ordenar("miga")}>Miga</th>
              <th style={th} onClick={() => ordenar("coadas")}>Coadas</th>
              <th style={th} onClick={() => ordenar("tipo_edificio")}>Tipo Edificio</th>
              <th style={th} onClick={() => ordenar("tipo_repliegue")}>Tipo Repliegue</th>
              <th style={th} onClick={() => ordenar("tipo_senda")}>Senda</th>
              <th style={th} onClick={() => ordenar("fecha_abandono")}>Abandono</th>
              <th style={th} onClick={() => ordenar("prioritario")}>Prioritaria</th>
            </tr>
          </thead>

          <tbody>
            {datosFiltrados.map((item) => (
              <tr key={item.id}>
                <td
                  style={{ ...td, cursor: "pointer" }}
                  onClick={() => {
                    if (!item?.id) {
                      console.error("ID inválido:", item);
                      return;
                    }
                    router.push(`/ficha?id=${item.id}`);
                  }}
                >
                  {item.atlas}
                </td>
                <td style={td}>{item.lote}</td>
                <td style={td}>{item.nombre}</td>
                <td style={td}>{item.provincia}</td>
                <td style={td}>{item.miga}</td>
                <td style={td}>{item.coadas}</td>
                <td style={td}>{item.tipo_edificio}</td>
                <td style={td}>{item.tipo_repliegue}</td>
                <td style={td}>{item.tipo_senda || "ACELERADA_2026"}</td>
                <td style={td}>{item.fecha_abandono}</td>
                <td style={td}>{item.prioritario ? "SI" : "NO"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 🎨 ESTILOS
const th = {
  border: "1px solid #999",
  padding: "4px 6px",
  fontWeight: "bold",
  textAlign: "left" as const,
  cursor: "pointer",
};

const td = {
  border: "1px solid #ccc",
  padding: "3px 6px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const inputFiltro = {
  width: "100%",
  fontSize: 11,
  padding: 2,
};
