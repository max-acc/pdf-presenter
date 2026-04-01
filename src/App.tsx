import {Routes, Route, Navigate, HashRouter} from "react-router"
import Sender from "./sender/Sender"
import Viewer from "./receiver/Viewer"

function App() {
  return (
      <HashRouter>
          <Routes>
              <Route path="/" element={<Navigate to="/sender" replace />} />
              <Route path={"/sender"} element={<Sender />} />
              <Route path={"/receiver"} element={<Viewer />} />
          </Routes>
      </HashRouter>
  )
}

export default App
