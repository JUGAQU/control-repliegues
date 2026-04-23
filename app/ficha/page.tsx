"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";

type Ficha = {
  id: number;
  atlas: string | null;
  nombre: string | null;
  provincia: string | null;
  lote: string | null;
  miga: string | null;
  observaciones: string | null;
};

type Reasignacion = {
  id: number;
  atlas: string | null;
  at: string | null;
  tipo: string | null;
  servicio: string | null;
  administrativo: string | null;
  ordenes: string | null;
  diversificado: string | null;
  tipo_diversificado: string | null;
  tipo_velocidad_interface: string | null;
  sgipe: string | null;
  modo_reasignacion: string | null;
  indicaciones_para_el_encaminamiento: string | null;
  puentes_central_numero_de_puentes: string | null;
  observaciones_del_estudio: string | null;
  estado_trabajos: string | null;
  cuestionario: string | null;
  pba_atenuacion: string | null;
  autonegociacion: string | null;
  configuracion_puerto_destino: string | null;
  supervisa_corte: string | null;
  observaciones_preparacion_reasignacion: string | null;
  orden_atlas: string | null;
  estado_orden_atlas: string | null;
  uo_atlas: string | null;
  numero_de_actuaciones: string | null;
  geco: string | null;
  cex: string | null;
  rima: string | null;
  redes_priv: string | null;
  dwdm: string | null;
  ventana_geco: string | null;
  grupo: string | null;
  fecha_prevista_actuacion: string | null;
  fecha_certificacion: string | null;
  observaciones_certificacion: string | null;
  facturable: string | null;
  fecha_ejecucion: string | null;
};

const fichaVacia: Ficha = {
  id: 0,
  atlas: "",
  nombre: "",
  provincia: "",
  lote: "",
  miga: "",
  observaciones: "",
};

export default function FichaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [formData, setFormData] = useState<Ficha>(fichaVacia);
  const [reasignaciones, setReasignaciones] = useState<Reasignacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const cargar = async () => {
      if (!id) {
        setError("No se ha recibido el id de la ficha");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("fichas")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Error cargando ficha:", error);
        setError("No se ha podido cargar la ficha");
        setLoading(false);
        return;
      }

      const ficha: Ficha = {
        id: data.id,
        atlas: data.atlas ?? "",
        nombre: data.nombre ?? "",
        provincia: data.provincia ?? "",
        lote: data.lote ?? "",
        miga: data.miga ?? "",
        observaciones: data.observaciones ?? "",
      };

      setFormData(ficha);

      if (ficha.atlas) {
        const { data: reasData, error: reasError } = await supabase
          .from("reasignaciones")
          .select("*")
          .eq("atlas", ficha.atlas)
          .order("id", { ascending: true });

        if (reasError) {
          console.error("Error cargando reasignaciones:", reasError);
        } else {
          setReasignaciones((reasData as Reasignacion[]) || []);
        }
      }

      setLoading(false);
    };

    cargar();
  }, [id]);

  const guardarFicha = async () => {
    if (!formData.id) return;

    setSaving(true);
    setMensaje("");
    setError("");

    const { error } = await supabase
      .from("fichas")
      .update({
        atlas: formData.atlas,
        nombre: formData.nombre,
        provincia: formData.provincia,
        lote: formData.lote,
        miga: formData.miga,
        observaciones: formData.observaciones,
      })
      .eq("id", formData.id);

    if (error) {
      console.error("Error guardando ficha:", error);
      setError("No se ha podido guardar la ficha");
    } else {
      setMensaje("Ficha guardada correctamente");
    }

    setSaving(false);
  };

  const handleChange = (field: keyof Ficha, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div style={{ padding: 20, fontFamily: "Arial" }}>
        Cargando ficha...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 20,
        background: "#f4f7fb",
        minHeight: "100vh",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 4px 18px rgba(0,0,0,0.12)",
          padding: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 24 }}>Ficha</h1>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => router.push("/listado")}
              style={botonGris}
            >
              Volver
            </button>

            <button
              type="button"
              onClick={guardarFicha}
              disabled={saving}
              style={botonAzul}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 15,
              padding: 10,
              borderRadius: 6,
              background: "#ffe5e5",
              color: "#b30000",
            }}
          >
            {error}
          </div>
        )}

        {mensaje && (
          <div
            style={{
              marginBottom: 15,
              padding: 10,
              borderRadius: 6,
              background: "#e7f7e7",
              color: "#1f6b1f",
            }}
          >
            {mensaje}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 15,
            marginBottom: 25,
          }}
        >
          <InputBox
            label="ATLAS"
            value={formData.atlas || ""}
            onChange={(v) => handleChange("atlas", v)}
          />
          <InputBox
            label="Nombre"
            value={formData.nombre || ""}
            onChange={(v) => handleChange("nombre", v)}
          />
          <InputBox
            label="Provincia"
            value={formData.provincia || ""}
            onChange={(v) => handleChange("provincia", v)}
          />
          <InputBox
            label="Lote"
            value={formData.lote || ""}
            onChange={(v) => handleChange("lote", v)}
          />
          <InputBox
            label="Miga"
            value={formData.miga || ""}
            onChange={(v) => handleChange("miga", v)}
          />
        </div>

        <div style={{ marginBottom: 30 }}>
          <div style={labelStyle}>Observaciones</div>
          <textarea
            value={formData.observaciones || ""}
            onChange={(e) => handleChange("observaciones", e.target.value)}
            style={{
              width: "100%",
              minHeight: 100,
              border: "1px solid #ccc",
              borderRadius: 6,
              padding: 10,
              fontSize: 14,
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ marginTop: 30 }}>
          <h2 style={{ marginBottom: 15 }}>Reasignaciones asociadas</h2>

          {reasignaciones.length === 0 ? (
            <div
              style={{
                padding: 12,
                background: "#f8f8f8",
                border: "1px solid #ddd",
                borderRadius: 8,
                color: "#666",
              }}
            >
              No hay reasignaciones para este atlas.
            </div>
          ) : (
            reasignaciones.map((r, index) => (
              <div
                key={r.id || index}
                style={{
                  border: "1px solid #7fa1b8",
                  background: "#cfe6f5",
                  marginBottom: 14,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px repeat(6, minmax(120px, 1fr))",
                    gap: 10,
                    alignItems: "start",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 24,
                      textAlign: "center",
                      paddingTop: 20,
                    }}
                  >
                    {index + 1}
                  </div>

                  <Campo label="Tipo" value={r.tipo} />
                  <Campo label="Servicio" value={r.servicio} />
                  <Campo label="SGIPE" value={r.sgipe} />
                  <Campo label="Modo Reasignación" value={r.modo_reasignacion} />
                  <Campo
                    label="Indicaciones Para el Encaminamiento"
                    value={r.indicaciones_para_el_encaminamiento}
                  />
                  <Campo label="Facturable" value={r.facturable} />
                  <Campo
                    label="Estado Trabajos"
                    value={r.estado_trabajos}
                    color={colorEstado(r.estado_trabajos)}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(120px, 1fr))",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  <Campo label="Administrativo" value={r.administrativo} />
                  <Campo label="Orden de partida" value={r.ordenes} />
                  <Campo label="Diversificado" value={r.diversificado} />
                  <Campo label="Tipo Diversif." value={r.tipo_diversificado} />
                  <Campo label="Tipo Interfaz" value={r.tipo_velocidad_interface} />
                  <Campo label="Ptes Cent/Nº Ptes." value={r.puentes_central_numero_de_puentes} />
                  <Campo label="Fecha Ejecución" value={r.fecha_ejecucion} />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, minmax(140px, 1fr))",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  <Campo
                    label="Observaciones Estudio Reasignación"
                    value={r.observaciones_del_estudio}
                  />
                  <Campo label="Orden Atlas" value={r.orden_atlas} />
                  <Campo label="Estado Ord en Atlas" value={r.estado_orden_atlas} />
                  <Campo label="UO Atlas" value={r.uo_atlas} />
                  <Campo label="Nº Actuaciones" value={r.numero_de_actuaciones} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function InputBox({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          border: "1px solid #ccc",
          borderRadius: 6,
          padding: 10,
          fontSize: 14,
        }}
      />
    </div>
  );
}

function Campo({
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
          fontSize: 12,
          color: "#0b5394",
          fontWeight: 700,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          minHeight: 34,
          background: color,
          border: "1px solid #6f6f6f",
          padding: "6px 8px",
          fontSize: 13,
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

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#0b5394",
  fontWeight: 700,
  marginBottom: 6,
};

const botonAzul: React.CSSProperties = {
  padding: "10px 16px",
  background: "#0070f3",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 14,
};

const botonGris: React.CSSProperties = {
  padding: "10px 16px",
  background: "#e9ecef",
  color: "#222",
  border: "1px solid #ccc",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 14,
};
