import React, { useEffect, useState, useRef } from "react";
import socket from "../utils/socket";
import { useNavigate, useParams, useLocation } from "react-router-dom";

interface Mensaje {
  nombreUsuario: string;
  contenido: string;
}

const Chat: React.FC = () => {
  const { sala } = useParams<{ sala: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const nombreUsuario = location.state?.nombreUsuario as string | undefined;
  const pin = location.state?.pin as string | undefined;

  const [conectados, setConectados] = useState<number>(0);
  const [limite, setLimite] = useState<number>(0);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [mensajeInput, setMensajeInput] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [usuarios, setUsuarios] = useState<string[]>([]);
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sala || !nombreUsuario || !pin) {
      navigate("/unir");
      return;
    }

    socket.emit("unirSala", { sala, nombreUsuario, pin });
    // Pedir el estado de la sala explícitamente después de unirse
    socket.emit("pedirEstadoSala", sala);

    const onSalaCreada = ({ sala: salaCreada, nombreUsuario }: { sala: string; nombreUsuario: string }) => {
      setMensajes(prev => [
        ...prev,
        { nombreUsuario: "Sistema", contenido: `Sala "${salaCreada}" creada.` },
        { nombreUsuario: "Sistema", contenido: `${nombreUsuario} se ha unido.` }
      ]);
    };

    const onNuevoUsuario = ({ nombreUsuario, ip }: { nombreUsuario: string; ip?: string }) => {
      const msg = ip ? `${nombreUsuario} se ha unido desde IP ${ip}` : `${nombreUsuario} se ha unido.`;
      setMensajes(prev => [...prev, { nombreUsuario: "Sistema", contenido: msg }]);
    };

    const onMensajePrivado = ({ contenido }: { contenido: string }) => {
      setMensajes(prev => [...prev, { nombreUsuario: "Sistema", contenido }]);
    };

    const onMensaje = (msg: Mensaje) => {
      setMensajes(prev => [...prev, msg]);
    };

    const onUsuarioDesconectado = ({ nombreUsuario }: { nombreUsuario: string }) => {
      setMensajes(prev => [...prev, { nombreUsuario: "Sistema", contenido: `${nombreUsuario} ha salido.` }]);
    };

    socket.on("estadoSala", (estado) => {
      setConectados(estado.conectados);
      setLimite(estado.capacidadMaxima);
      if (estado.usuarios) setUsuarios(estado.usuarios);
     // alert(`DEBUG\nconectados: ${estado.conectados}\nlimite: ${estado.capacidadMaxima}\nusuarios: ${estado.usuarios?.join(", ")}`);
    });

    socket.on("salaCreada", onSalaCreada);
    socket.on("nuevoUsuario", onNuevoUsuario);
    socket.on("mensajePrivado", onMensajePrivado);
    socket.on("mensaje", onMensaje);
    socket.on("usuarioDesconectado", onUsuarioDesconectado);

    return () => {
      socket.off("salaCreada", onSalaCreada);
      socket.off("nuevoUsuario", onNuevoUsuario);
      socket.off("mensajePrivado", onMensajePrivado);
      socket.off("mensaje", onMensaje);
      socket.off("usuarioDesconectado", onUsuarioDesconectado);
      socket.off("estadoSala");
      socket.removeAllListeners();
    };
  }, [sala, nombreUsuario, pin, navigate]);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviarMensaje = () => {
    const contenido = mensajeInput.trim();
    if (!contenido) return;
    socket.emit("mensaje", { contenido });
    setMensajeInput("");
  };

  const copiarPin = () => {
    if (!pin) return;
    navigator.clipboard.writeText(pin).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  const manejarDesconectar = () => {
    if (!sala || !nombreUsuario) return;
    socket.emit("salirSala", { sala, nombreUsuario });
    socket.removeAllListeners();
    navigate("/unir");
  };

  return (
    <div
      style={{
        maxWidth: 800,
        display: "flex",
        gap: "40px",
        padding: "20px",
        background: "rgba(30, 30, 47, 0.8)",
        borderRadius: "16px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
        alignItems: "center",
      }}
    >
      <div style={{ width: "600px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <h2 style={{ textAlign: "center", textShadow: "0 0 8px #9f7aea88", margin: 0 }}>
          Chat en sala: {sala}
        </h2>

        <div
          style={{
            height: "400px",
            overflowY: "auto",
            padding: "16px",
            background: "rgba(46, 46, 66, 0.6)",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {mensajes.map((msg, i) => {
            const esPropio = msg.nombreUsuario === nombreUsuario;
            const esSistema = msg.nombreUsuario === "Sistema";
            const bg = esSistema
              ? "rgba(255,255,255,0.1)"
              : esPropio
              ? "linear-gradient(145deg, #6a00b0, #370064)"
              : "rgba(255,255,255,0.2)";
            const color = esSistema
              ? "#bbbbbb"
              : esPropio
              ? "#e0d9ff"
              : "#f5f5f5";

            return (
              <div
                key={i}
                style={{
                  alignSelf: esPropio ? "flex-end" : "flex-start",
                  background: bg,
                  color,
                  padding: "10px 14px",
                  borderRadius: "20px",
                  maxWidth: "70%",
                  wordBreak: "break-word",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                }}
              >
                {!esSistema && (
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      marginBottom: "4px",
                      opacity: 0.8,
                    }}
                  >
                    {msg.nombreUsuario}
                  </div>
                )}
                <div>{msg.contenido}</div>
              </div>
            );
          })}
          <div ref={mensajesEndRef} />
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <input
            placeholder="Escribe tu mensaje"
            value={mensajeInput}
            onChange={(e) => setMensajeInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              background: "#1e1e2f",
              color: "#e0d9ff",
              outline: "none",
            }}
          />
          <button
            onClick={enviarMensaje}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(145deg, #370064, #6a00b0)",
              color: "#e0d9ff",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(108, 51, 255, 0.5)",
            }}
          >
            Enviar
          </button>
        </div>

        <button
          style={{
            marginTop: "12px",
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#b00020",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(176, 0, 32, 0.7)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#ff1a3c")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#b00020")}
          onClick={manejarDesconectar}
        >
          Desconectar
        </button>
      </div>
   
      <div
        style={{
          width: "200px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          background: "linear-gradient(145deg, #370064, #6a00b0)",
          padding: "16px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        <h3
          style={{
            margin: 0,
            textAlign: "center",
            color: "#e0d9ff",
            textShadow: "0 0 6px #9f7aea88",
          }}
        >
          PIN de Sala
        </h3>
        <div
          style={{
            fontSize: "1.4rem",
            fontWeight: "700",
            textAlign: "center",
            color: "#fff",
            background: "rgba(255,255,255,0.1)",
            padding: "10px",
            borderRadius: "8px",
            userSelect: "text",
          }}
        >
          {pin}
        </div>
        <button
          onClick={copiarPin}
          style={{
            background: "#e0d9ff",
            color: "#370064",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(224, 217, 255, 0.5)",
          }}
        >
          {copiado ? "¡Copiado!" : "Copiar PIN"}
        </button>
        <div style={{ color: "#fff", fontSize: "0.9rem" }}>
          {conectados} / {limite} conectados
        </div>
        <div style={{ color: "#fff", fontSize: "0.9rem", marginTop: 8 }}>
          <b>Usuarios:</b>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {usuarios.map((u) => (
              <li key={u} style={{ fontSize: "0.9rem", color: "#e0d9ff" }}>{u}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Chat;
