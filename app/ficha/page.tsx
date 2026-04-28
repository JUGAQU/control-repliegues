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
        <input
          placeholder="Grupo"
          value={filtroGrupo}
          onChange={(e)=>setFiltroGrupo(e.target.value)}
          style={{
            width:80,
            height:22,
            fontSize:11,
            padding:"1px 5px",
            border:"1px solid #7fa7c7",
            borderRadius:3
          }}
        />
