{reasignaciones.map((r: any, index: number) => (
  <div
    key={r.id || index}
    style={{
      display: "flex",
      border: "1px solid #8ea9bf",
      background: "#c9e3f2",
      marginBottom: 12,
      overflow: "hidden"
    }}
  >

    {/* COLUMNA NUMERO IZQUIERDA */}
    <div
      style={{
        width:70,
        minWidth:70,
        background:"#bdd7e7",
        borderRight:"1px solid #7f9db9",
        display:"flex",
        alignItems:"flex-start",
        justifyContent:"center",
        paddingTop:12,
        fontSize:28,
        fontWeight:"bold",
        color:"#1f1f1f"
      }}
    >
      {index+1}
    </div>


    {/* BLOQUE DERECHA */}
    <div
      style={{
        flex:1,
        padding:10
      }}
    >

      {/* FILA 1 */}
      <div
        style={{
          display:"flex",
          gap:10,
          flexWrap:"nowrap",
          overflowX:"auto",
          marginBottom:10
        }}
      >

        <CampoReaAuto
          label="Estado Trabajos"
          value={r.estado_trabajos}
          minWidth={140}
          color={colorEstado(r.estado_trabajos)}
        />

        <CampoReaAuto
          label="Tipo"
          value={r.tipo}
          minWidth={100}
        />

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

        <CampoReaAuto
          label="Tipo Interface"
          value={r.tipo_velocidad_interface}
          minWidth={180}
        />

        <CampoReaAuto
          label="Velocidad"
          value={extraerVelocidad(r.tipo_velocidad_interface)}
          minWidth={100}
        />

      </div>



      {/* FILA 2 */}
      <div
        style={{
          display:"flex",
          gap:10,
          flexWrap:"nowrap",
          overflowX:"auto",
          marginBottom:10
        }}
      >

        <CampoReaAuto
          label="Modo Reasignación"
          value={r.modo_reasignacion}
          minWidth={280}
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

      </div>



      {/* FILA 3 */}
      <CampoRea
        label="Observaciones Estudio Reasignación"
        value={r.observaciones_del_estudio}
      />

    </div>

  </div>
))}
