import React from "react";

type Props = {
  formData: any;
  handleChange?: any;
};

export default function CabeceraFicha({ formData, handleChange }: Props) {
  return (
    <div
  style={{
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #b7c6d0",
    padding: "12px 10px",
    background: "#c9e3f2",
    display: "flex",
    flexWrap: "nowrap",
    overflowX: "auto",
    gap: 8,
    marginBottom: 5,
    fontFamily: "Arial",
  }}
>
  <div style={{ fontSize:12, fontWeight:"bold", color:"#0b5394" }}>
    Atlas:
    <input
      value={formData?.atlas || ""}
      readOnly
      style={{
        marginLeft:4,
        width:58,
        height:20,
        background:"#eee",
        color:"#666",
        border:"1px solid #999",
        borderRadius:4,
        fontSize:11,
      }}
    />
  </div>

  <div style={{ fontSize:12, fontWeight:"bold", color:"#0b5394" }}>
    Lote:
    <input
      value={formData?.lote || ""}
      readOnly
      style={{
        marginLeft:4,
        width:70,
        height:20,
        background:"#d9ead3",
        border:"1px solid #93c47d",
        borderRadius:4,
        fontSize:11,
      }}
    />
  </div>
</div>
  );
}
