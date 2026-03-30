import {BrowserRouter, Routes, Route, Navigate} from "react-router"
import Sender from "./sender/Sender"
import Viewer from "./receiver/Viewer"
import './App.css'

function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<Navigate to="/sender" replace />} />
              <Route path={"/sender"} element={<Sender />} />
              <Route path={"/receiver"} element={<Viewer />} />
          </Routes>
      </BrowserRouter>
  )
}

export default App
