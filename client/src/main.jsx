//import './index.css'
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Notes from './pages/Notes';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
      <Router>
          <Routes>
              {/* <Route path="/" element={<Home />} /> */}
              <Route path="/notes" element={<Notes />} />
              <Route path="/" element={<Notes to="/notes" />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
          </Routes>
      </Router>
  </AuthProvider>
);

// const root = ReactDOM.createRoot(document.getElementById('root'));

// root.render(
//   <React.StrictMode>
//       <AuthProvider>
//           <Router>
//               <Routes>
//                   <Route path="/" element={<Home />} />
//                   <Route path="/notes" element={<Notes />} />
//                   <Route path="/signup" element={<Signup />} />
//                   <Route path="/login" element={<Login />} />
//               </Routes>
//           </Router>
//       </AuthProvider>
//   </React.StrictMode>
// );
