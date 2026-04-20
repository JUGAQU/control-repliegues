"use client";
import { useState } from "react";
import { datos } from "../data";
import { useRouter } from "next/navigation";

export default function Listado() {
  const router = useRouter();

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

  // Orden por defecto al cargar: atlas ascendente
  const [orden, setOrden] = useState<{
    campo: string;
    direccion: "asc" | "desc";
  }>({
    campo: "atlas",
    direccion: "asc",
  });

  const ordenar = (campo: string) => {
    let direccion: "asc" | "desc" = "asc";

    if (orden.campo === campo && orden.direccion === "asc") {
      direccion = "desc";
    }

    setOrden({ campo, direccion });
  };

  const datosFiltrados = datos
    .filter((item) => {
      return (
        (item.atlas || "").toLowerCase().includes(filtros.atlas.toLowerCase()) &&
        (item.lote || "").toLowerCase().includes(filtros.lote.toLowerCase()) &&
        (item.nombre || "").toLowerCase().includes(filtros.nombre.toLowerCase()) &&
        (item.provincia || "").toLowerCase().includes(filtros.provincia.toLowerCase()) &&
        (item.miga || "").toLowerCase().includes(filtros.miga.toLowerCase()) &&
        (item.coordenadas || "").toLowerCase().includes(filtros.coordenadas.toLowerCase()) &&
        (item.tipo_edificio || "").toLowerCase().includes(filtros.tipo_edificio.toLowerCase()) &&
        (item.tipo_repliegue || "").toLowerCase().includes(filtros.tipo_repliegue.toLowerCase()) &&
        ((item.tipo_senda || "ACELERADA_2026").toLowerCase()).includes(
          filtros.tipo_senda.toLowerCase()
        ) &&
        ((item.fecha_abandono || "").toLowerCase()).includes(
          filtros.fecha_abandono.toLowerCase()
        ) &&
        ((item.prioritario ? "si" : "no").toLowerCase()).includes(
          filtros.prioritario.toLowerCase()
        )
      );
    })
    .sort((a: any, b: any) => {
      if (!orden.campo) return 0;

      const valorA = (a[orden.campo] || "")
        .toString()
        .toLowerCase()
        .replace(/\./g, "");
      const valorB = (b[orden.campo] || "")
        .toString()
        .toLowerCase()
        .replace(/\./g, "");

      if (valorA < valorB) return orden.direccion === "asc" ? -1 : 1;
      if (valorA > valorB) return orden.direccion === "asc" ? 1 : -1;
      return 0;
    });

  const flecha = (campo: string) => {
    if (orden.campo !== campo) return "";
    return orden.direccion === "asc" ? " ▲" : " ▼";
  };

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
            <tr>
              {Object.keys(filtros).map((campo) => (
                <th key={campo} style={th}>
                  <input
                    placeholder="Filtrar"
                    value={filtros[campo as keyof typeof filtros]}
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

            <tr style={{ background: "#ddd" }}>
              <th style={th} onClick={() => ordenar("atlas")}>
                Atlas{flecha("atlas")}
              </th>
              <th style={th} onClick={() => ordenar("lote")}>
                Lote{flecha("lote")}
              </th>
              <th style={th} onClick={() => ordenar("nombre")}>
                Nombre{flecha("nombre")}
              </th>
              <th style={th} onClick={() => ordenar("provincia")}>
                Provincia{flecha("provincia")}
              </th>
              <th style={th} onClick={() => ordenar("miga")}>
                Miga{flecha("miga")}
              </th>
              <th style={th} onClick={() => ordenar("coordenadas")}>
                Coordenadas{flecha("coordenadas")}
              </th>
              <th style={th} onClick={() => ordenar("tipo_edificio")}>
                Tipo Edificio{flecha("tipo_edificio")}
              </th>
              <th style={th} onClick={() => ordenar("tipo_repliegue")}>
                Tipo Repliegue{flecha("tipo_repliegue")}
              </th>
              <th style={th} onClick={() => ordenar("tipo_senda")}>
                Senda{flecha("tipo_senda")}
              </th>
              <th style={th} onClick={() => ordenar("fecha_abandono")}>
                Abandono{flecha("fecha_abandono")}
              </th>
              <th style={th} onClick={() => ordenar("prioritario")}>
                Prioritaria{flecha("prioritario")}
              </th>
            </tr>
          </thead>

          <tbody>
            {datosFiltrados.map((item, i) => (
              <tr key={i}>
                <td
                  style={{
                    ...td,
                    cursor: "pointer",
                  }}
                  onClick={() => router.push(`/ficha?id=${i}`)}
                >
                  {item.atlas}
                </td>
                <td style={td}>{item.lote}</td>
                <td style={td}>{item.nombre}</td>
                <td style={td}>{item.provincia}</td>
                <td style={td}>{item.miga}</td>
                <td style={td}>{item.coordenadas}</td>
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

const th = {
  border: "1px solid #999",
  padding: "4px 6px",
  fontWeight: "bold",
  textAlign: "left" as const,
  cursor: "pointer",
  background: "#ddd",
};

const td = {
  border: "1px solid #ccc",
  padding: "3px 6px",
  whiteSpace: "nowrap" as const,
  overflow: "hidden",
  textOverflow: "ellipsis",
  background: "#fff",
};

const inputFiltro = {
  width: "100%",
  fontSize: 11,
  padding: 2,
  boxSizing: "border-box" as const,
};
