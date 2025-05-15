import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ReactGA from "react-ga4";
import { AuthProvider } from "./database/authcontext";
import ProtectedRoute from "./components/ProtectedRoute"; 
import Login from "./view/Login";
import Encabezado from "./components/Encabezado";
import Inicio from "./view/Inicio";
import Categorias from "./view/Categorias";
import Productos from "./view/Productos";
import Catalogo from "./view/Catalogo";
import Pronunciacion from "./view/Pronunciacion";
import Libros from "./view/Libros";
import Clima from "./view/Clima";

import './App.css'

function App() {

  ReactGA.initialize("your GA measurement id");
  return (
    <>
      <AuthProvider>
        <Router>
            <Encabezado />
            <main>
              <Routes>
                
                <Route path="/" element={<Login />} />
                <Route path="/inicio" element={<ProtectedRoute element={<Inicio />} />} />
                <Route path="/categorias" element={<ProtectedRoute element={<Categorias />} />}/> //Ruta de Categorias protegida
                <Route path="/productos" element={<ProtectedRoute element={<Productos />} />}/>
                <Route path="/pronuncia" element={<ProtectedRoute element={<Pronunciacion/>}/>}/>
                <Route path="/catalogo" element={<ProtectedRoute element={<Catalogo/>}/>}/>
                <Route path="/libro" element={<ProtectedRoute element={<Libros/>}/>}/>
                <Route path="/clima" element={<ProtectedRoute element={<Clima />} />}/>
              </Routes>
            </main> 
        </Router>
      </AuthProvider>
    </>
  )
}

export default App