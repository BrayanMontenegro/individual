    import React, { useState, useEffect } from "react";
    import { Container, Button, Col } from "react-bootstrap";
    import { db } from "../database/firebaseconfig";
    import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    } from "firebase/firestore";

    // Importaciones de componentes personalizados
    import TablaCategorias from "../components/categorias/TablaCategorias";
    import ModalRegistroCategoria from "../components/categorias/ModalRegistroCategoria";
    import ModalEdicionCategoria from "../components/categorias/ModalEdicionCategoria";
    import ModalEliminacionCategoria from "../components/categorias/ModalEliminacionCategoria";
    import Cuadrobusqueda from "../components/busquedas/CuadroBusqueda";
    import ChatIA from "../components/chat/ChatIA";


    const Categorias = () => {
        
        // Estados para manejo de datos
        const [categorias, setCategorias] = useState([]);
        const [showModal, setShowModal] = useState(false);
        const [showEditModal, setShowEditModal] = useState(false);
        const [showDeleteModal, setShowDeleteModal] = useState(false);
        const [nuevaCategoria, setNuevaCategoria] = useState({
            nombre: "",
            descripcion: "",
        });
        const [isOffline, setIsOffline] = useState(!navigator.onLine);
        const [showChatModal, setShowChatModal] = useState(false);
        const [categoriaEditada, setCategoriaEditada] = useState(null);
        const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
        const [categoriaFiltradas, setCategoriaFiltradas] = useState([]);
        const [searchText,setSearchText] = useState("");

        // Referencia a la colección de categorías en Firestore
        const categoriasCollection = collection(db, "categorias");


        useEffect(() => {
            const handleOnline = () => {
              setIsOffline(false);
            };
            const handleOffline = () => {
              setIsOffline(true);
            };
            window.addEventListener("online", handleOnline);
            window.addEventListener("offline", handleOffline);
            setIsOffline(!navigator.onLine);
            return () => {
              window.removeEventListener("online", handleOnline);
              window.removeEventListener("offline", handleOffline);
            };
          }, []);

        // Función para obtener todas las categorías de Firestore
        const fetchCategorias = () => {
    const stopListening = onSnapshot(categoriasCollection, (snapshot) => {
      const fetchedCategorias = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCategorias(fetchedCategorias);
      setCategoriaFiltradas(fetchedCategorias);
      console.log("Categorías cargadas desde Firestore:", fetchedCategorias);
      if (isOffline) {
        console.log("Offline: Mostrando datos desde la caché local.");
      }
    }, (error) => {
      console.error("Error al escuchar categorías:", error);
      if (isOffline) {
        console.log("Offline: Mostrando datos desde la caché local.");
      } else {
        alert("Error al cargar las categorías: " + error.message);
      }
    });
    return stopListening;
  };

        const handeleSearchChange = (e) => {
            const text = e.target.value.toLowerCase();
            setSearchText(text);
        
            const filtradas = categorias.filter((categoria) => 
                categoria.nombre.toLowerCase().includes(text) ||
                categoria.descripcion.toLowerCase().includes(text)
            );
        
            setCategoriaFiltradas(filtradas);
        };
        

        // Hook useEffect para carga inicial de datos
        useEffect(() => {
            const cleanupListener = fetchCategorias();
            return () => cleanupListener();
          }, []);

        // Manejador de cambios en inputs del formulario de nueva categoría
        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setNuevaCategoria((prev) => ({
            ...prev,
            [name]: value,
            }));
        };

        // Manejador de cambios en inputs del formulario de edición
        const handleEditInputChange = (e) => {
            const { name, value } = e.target;
            setCategoriaEditada((prev) => ({
            ...prev,
            [name]: value,
            }));
        };

        // Función para agregar una nueva categoría (CREATE)
        const handleAddCategoria = async () => {
            // Validar campos requeridos
            if (!nuevaCategoria.nombre || !nuevaCategoria.descripcion) {
              alert("Por favor, completa todos los campos antes de guardar.");
              return;
            }
        
            // Cerrar modal
            setShowModal(false);
          
            // Crear ID temporal para offline y objeto de categoría
            const tempId = `temp_${Date.now()}`;
            const categoriaConId = { ...nuevaCategoria, id: tempId };
          
            try {
              // Actualizar estado local para reflejar la nueva categoría
              setCategorias((prev) => [...prev, categoriaConId]);
              setCategoriaFiltradas((prev) => [...prev, categoriaConId]);
        
              // Limpiar campos del formulario
              setNuevaCategoria({ nombre: "", descripcion: "" });
          
              // Intentar guardar en Firestore
              await addDoc(categoriasCollection, nuevaCategoria);
          
              // Mensaje según estado de conexión
              if (isOffline) {
                console.log("Categoría agregada localmente (sin conexión).");
              } else {
                console.log("Categoría agregada exitosamente en la nube.");
              }
            } catch (error) {
              console.error("Error al agregar la categoría:", error);
          
              // Manejar error según estado de conexión
              if (isOffline) {
                console.log("Offline: Categoría almacenada localmente.");
              } else {
                // Revertir cambios locales si falla en la nube
                setCategorias((prev) => prev.filter((cat) => cat.id !== tempId));
                setCategoriaFiltradas((prev) => prev.filter((cat) => cat.id !== tempId));
                alert("Error al agregar la categoría: " + error.message);
              }
            }
          };

        // Función para actualizar una categoría existente (UPDATE)
        const handleEditCategoria = async () => {
            if (!categoriaEditada?.nombre || !categoriaEditada?.descripcion) {
              alert("Por favor, completa todos los campos antes de actualizar.");
              return;
            }
            
            setShowEditModal(false);
        
            const categoriaRef = doc(db, "categorias", categoriaEditada.id);
          
            try {
              // Intentar actualizar en Firestore
              await updateDoc(categoriaRef, {
                nombre: categoriaEditada.nombre,
                descripcion: categoriaEditada.descripcion,
              });
        
              console.log('Red desconectada:', isOffline )
          
              if (isOffline) {
                // Actualizar estado local inmediatamente si no hay conexión
                setCategorias((prev) =>
                  prev.map((cat) =>
                    cat.id === categoriaEditada.id ? { ...categoriaEditada } : cat
                  )
                );
                setCategoriaFiltradas((prev) =>
                  prev.map((cat) =>
                    cat.id === categoriaEditada.id ? { ...categoriaEditada } : cat
                  )
                );
                console.log("Categoría actualizada localmente (sin conexión).");
                alert(
                  "Sin conexión: Categoría actualizada localmente. Se sincronizará cuando haya internet."
                );
              } else {
                // Si hay conexión, confirmar éxito en la nube
                console.log("Categoría actualizada exitosamente en la nube.");
              }
            } catch (error) {
              // Manejar errores inesperados (no relacionados con la red)
              console.error("Error al actualizar la categoría:", error);
              setCategorias((prev) =>
                prev.map((cat) =>
                  cat.id === categoriaEditada.id ? { ...categoriaEditada } : cat
                )
              );
              setCategoriaFiltradas((prev) =>
                prev.map((cat) =>
                  cat.id === categoriaEditada.id ? { ...categoriaEditada } : cat
                )
              );
              alert("Ocurrió un error al actualizar la categoría: " + error.message);
            }
          };

        // Función para eliminar una categoría (DELETE)
        const handleDeleteCategoria = async () => {
            if (!categoriaAEliminar) return;
          
            // Cerrar modal
            setShowDeleteModal(false);
          
            try {
              // Actualizar estado local para reflejar la eliminación
              setCategorias((prev) => prev.filter((cat) => cat.id !== categoriaAEliminar.id));
              setCategoriaFiltradas((prev) => prev.filter((cat) => cat.id !== categoriaAEliminar.id));
          
              // Intentar eliminar en Firestore
              const categoriaRef = doc(db, "categorias", categoriaAEliminar.id);
              await deleteDoc(categoriaRef);
          
              // Mensaje según estado de conexión
              if (isOffline) {
                console.log("Categoría eliminada localmente (sin conexión).");
              } else {
                console.log("Categoría eliminada exitosamente en la nube.");
              }
            } catch (error) {
              console.error("Error al eliminar la categoría:", error);
          
              // Manejar error según estado de conexión
              if (isOffline) {
                console.log("Offline: Eliminación almacenada localmente.");
              } else {
                // Restaurar categoría en estado local si falla en la nube
                setCategorias((prev) => [...prev, categoriaAEliminar]);
                setCategoriaFiltradas((prev) => [...prev, categoriaAEliminar]);
                alert("Error al eliminar la categoría: " + error.message);
              }
            }
          };

        // Función para abrir el modal de edición con datos prellenados
        const openEditModal = (categoria) => {
            setCategoriaEditada({ ...categoria });
            setShowEditModal(true);
        };

        // Función para abrir el modal de eliminación
        const openDeleteModal = (categoria) => {
            setCategoriaAEliminar(categoria);
            setShowDeleteModal(true);
        };

        // Renderizado del componente
        return (
          <Container className="mt-5">
            <br />
            <h4>Gestión de Categorías</h4>
            <Button className="mb-3" onClick={() => setShowModal(true)}>
              Agregar categoría
            </Button>

            <Col lg={3} md={4} sm={4} xs={5}>
              <Button className="mb-3" onClick={() => setShowChatModal(true)} style={{ width: "100%" }}>
                Chat Con IA
              </Button>
            </Col>

            <Cuadrobusqueda
              searchText={searchText}
              handeleSearchChange={handeleSearchChange}
            />

            <TablaCategorias
              categorias={categoriaFiltradas}
              openEditModal={openEditModal}
              openDeleteModal={openDeleteModal}
            />

            <ModalRegistroCategoria
              showModal={showModal}
              setShowModal={setShowModal}
              nuevaCategoria={nuevaCategoria}
              handleInputChange={handleInputChange}
              handleAddCategoria={handleAddCategoria}
            />
            <ModalEdicionCategoria
              showEditModal={showEditModal}
              setShowEditModal={setShowEditModal}
              categoriaEditada={categoriaEditada}
              handleEditInputChange={handleEditInputChange}
              handleEditCategoria={handleEditCategoria}
            />
            <ModalEliminacionCategoria
              showDeleteModal={showDeleteModal}
              setShowDeleteModal={setShowDeleteModal}
              handleDeleteCategoria={handleDeleteCategoria}
            />

            {/* 💬 Aquí insertas el ChatIA */}
            <ChatIA
              showChatModal={showChatModal}
              setShowChatModal={setShowChatModal}
            />
          </Container>

        );
    };

    export default Categorias;