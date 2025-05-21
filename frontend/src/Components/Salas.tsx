import React, { useEffect, useState } from "react";
import socket from "../utils/socket";


const ListarSalas: React.FC = () => {
  const [salas, setSalas] = useState<string[]>([]);

  useEffect(() => {
    const manejarSalasDisponibles = (listaSalas: string[]) => {
      setSalas(listaSalas);
    };

    socket.on("salasDisponibles", manejarSalasDisponibles);
    socket.emit("listarSalas");

    return () => {
      socket.off("salasDisponibles", manejarSalasDisponibles);
    };
  }, []);

 return (
  <div
    className="rooms-container"
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      color: "#e0d9ff",
      width: "100%",
      maxWidth: "420px",  
      margin: "0 auto",
    }}
  >
    <h2
      style={{
        marginBottom: "20px",
        fontSize: "2.5rem",
      }}
    >
      Salas Disponibles
    </h2>

    {salas.length === 0 ? (
      <p style={{ fontStyle: "italic", opacity: 0.8 }}>
        No hay salas disponibles.
      </p>
    ) : (
      <ul
       className="rooms-list"  
        style={{
          listStyle: "none",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "10px",
          margin: "10 px 7px",
          gap: "5px",
          maxHeight: "210px",    // mantiene 3 filas de alto
          overflowY: "auto",     // scroll vertical
          overflowX: "hidden",   // sin scroll horizontal
        }}
      >
        {salas.map((sala) => (
          <li
            key={sala}
            style={{
              background:
                "linear-gradient(145deg, rgb(138, 186, 198), rgb(91, 230, 221))",
              padding: "12px 20px",
              borderRadius: "12px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 0 5px #bb86fc",
              userSelect: "none",
              color: "#FFFFFF",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.transform = "scale(1.03)";
              el.style.boxShadow = "0 0 12px #d7a3ff";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.transform = "scale(1)";
              el.style.boxShadow = "0 0 5px #bb86fc";
            }}
          >
            {sala}
          </li>
        ))}
      </ul>
    )}
  </div>
);


}

export default ListarSalas;
