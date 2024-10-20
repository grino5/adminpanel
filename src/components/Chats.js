import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, setDoc, doc, query, where } from 'firebase/firestore';
import { db, storage } from '../firebase/firebase'; // Importa Firebase Storage y Firestore
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Métodos de Firebase Storage
import './Chats.css'; // Importamos el archivo CSS
import '@fortawesome/fontawesome-free/css/all.min.css';

const Chats = () => {
  const [chatList, setChatList] = useState([]); // Estado para la lista de chats
  const [activeChat, setActiveChat] = useState(null); // Estado para el chat activo
  const [messages, setMessages] = useState([]); // Estado para almacenar los mensajes
  const [newMessage, setNewMessage] = useState(''); // Estado para el nuevo mensaje
  const adminID = sessionStorage.getItem('adminID'); // Obtener el adminID desde sessionStorage

  // Obtener lista de chats filtrados por el adminID
  useEffect(() => {
    if (adminID) {
      const chatsQuery = query(
        collection(db, 'chats'),
        where('Administradora', '==', adminID) // Filtramos los chats por el adminID
      );

      const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
        const chats = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Ordenamos los chats localmente por 'lastUpdated'
        const sortedChats = chats.sort((a, b) => b.lastUpdated?.toMillis() - a.lastUpdated?.toMillis());
        setChatList(sortedChats); // Establecemos la lista de chats ordenada
      });

      return () => unsubscribeChats();
    }
  }, [adminID]);

  // Cargar mensajes cuando se selecciona un chat
  useEffect(() => {
    if (activeChat) {
      const unsubscribeMessages = onSnapshot(collection(db, 'chats', activeChat.id, 'mensajes'), (snapshot) => {
        const loadedMessages = snapshot.docs
          .map(doc => {
            const docId = doc.id;
            const [order, sender] = docId.split(', ');
            return {
              order: parseInt(order, 10),
              sender: sender.trim(), // Capturamos el sender
              ...doc.data(),
            };
          })
          .sort((a, b) => a.order - b.order);

        setMessages(loadedMessages);
      });

      return () => unsubscribeMessages();
    }
  }, [activeChat]);

  // Función para reordenar los chats cada vez que se actualiza lastUpdated
  const reorderChats = () => {
    setChatList(prevChatList =>
      [...prevChatList].sort((a, b) => b.lastUpdated?.toMillis() - a.lastUpdated?.toMillis())
    );
  };

  // Manejo de envío de mensajes y actualización de lastUpdated
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !activeChat) return;

    try {
      const messageCount = messages.length + 1; // Número del siguiente mensaje
      const messageDocName = `${messageCount}, ${adminID}`; // Nombre del documento en formato "número, ID de administradora"
      
      // Guardar el mensaje en la subcolección 'mensajes'
      await setDoc(doc(db, 'chats', activeChat.id, 'mensajes', messageDocName), {
        contenido: newMessage,
        tipo: 'texto', // Tipo de contenido
        entregado: false, // Campo entregado en false
        es_administradora: true // Campo para identificar si es la administradora en true
      });

      // Actualizar el campo 'lastUpdated' en el documento del chat principal
      await setDoc(doc(db, 'chats', activeChat.id), {
        lastUpdated: new Date() // Actualizar la fecha y hora actual
      }, { merge: true }); // merge: true asegura que solo se actualice 'lastUpdated' sin sobrescribir otros campos

      // Reordenar los chats después de actualizar 'lastUpdated'
      reorderChats();

      // Limpiar el campo de entrada
      setNewMessage('');
    } catch (error) {
      console.error('Error al enviar mensaje: ', error);
    }
  };

  // Manejo de subida de archivos (fotos, videos, audios)
  const handleFileUpload = async (file) => {
    if (!file || !activeChat) return;

    try {
      const storageRef = ref(storage, `chats/${activeChat.id}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      const messageCount = messages.length + 1; // Número del siguiente mensaje
      const messageDocName = `${messageCount}, ${adminID}`;

      // Guardar el archivo en Firestore como un mensaje
      await setDoc(doc(db, 'chats', activeChat.id, 'mensajes', messageDocName), {
        contenido: downloadURL,
        tipo: file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'audio',
        entregado: false, // Campo entregado en false
        es_administradora: true // Campo para identificar si es la administradora en true
      });

      // Actualizar el campo 'lastUpdated' en el documento del chat principal
      await setDoc(doc(db, 'chats', activeChat.id), {
        lastUpdated: new Date() // Actualizar la fecha y hora actual
      }, { merge: true });

      // Reordenar los chats después de actualizar 'lastUpdated'
      reorderChats();

    } catch (error) {
      console.error('Error al subir archivo: ', error);
    }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <h3>Chats</h3>
        <ul className="chatList">
          {chatList.map(chat => (
            <li
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={chat.id === activeChat?.id ? "activeChatItem" : "chatItem"}
            >
              {chat['Nombre de Telegram']}
            </li>
          ))}
        </ul>
      </div>

      <div className="chatWindow">
        {activeChat ? (
          <>
            <div className="chatHeader">
              <h3>{activeChat['Nombre de Telegram']}</h3>
            </div>

            <div className="chatBox">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={
                    msg.sender === adminID 
                      ? "adminMessage rightMessage"  
                      : msg.sender === activeChat['ID de telegram'] // Verificamos si el sender es el ID del usuario
                      ? "userMessage leftMessage"
                      : ""
                  }
                >
                  {/* Mostrar contenido multimedia según el tipo de archivo */}
                  {msg.tipo === 'image' && <img src={msg.contenido} alt="Imagen" className="chatImage" />}
                  {msg.tipo === 'video' && <video controls src={msg.contenido} className="chatVideo" />}
                  {msg.tipo === 'audio' && <audio controls src={msg.contenido} className="chatAudio" />}
                  {msg.tipo === 'texto' && <p>{msg.contenido}</p>} {/* Aseguramos que el texto se muestre */}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="form">
              <label htmlFor="file-upload" className="fileUploadLabel">
                <i className="fas fa-paperclip"></i> {/* Ícono de clip */}
              </label>
              <input
                id="file-upload"
                type="file"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                accept="image/*,video/*,audio/*"
                className="fileInput"
              />
              
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="input"
              />

              <button type="submit" className="button">Enviar</button>
            </form>
          </>
        ) : (
          <div className="noChatSelected">Selecciona un chat para empezar</div>
        )}
      </div>
    </div>
  );
};

export default Chats;