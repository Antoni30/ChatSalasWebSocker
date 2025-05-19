import React, { useEffect, useState } from "react";
import socket from "../utils/socket";


const ListarSalas: React.FC = () => {
  const [salas, setSalas] = useState<string[]>([]);

  useEffect(() => {
    // Escuchar actualizaciones en tiempo real
    const manejarSalasDisponibles = (listaSalas: string[]) => {
      setSalas(listaSalas);
    };

    socket.on("salasDisponibles", manejarSalasDisponibles);

    // Pedir lista inicial (opcional si el servidor la envía al conectar)
    socket.emit("listarSalas");

    return () => {
      socket.off("salasDisponibles", manejarSalasDisponibles);
    };
  }, []);

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Salas Disponibles</h2>
      {salas.length === 0 ? (
        <p>No hay salas disponibles.</p>
      ) : (
        <ul>
          {salas.map((sala) => (
            <li key={sala}>{sala}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListarSalas;
