import React from "react";
import TextEditor from "./textEditor";
import "./index.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams
} from 'react-router-dom';
import { v4 as uuidV4 } from "uuid";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={`/documents/${uuidV4()}`} replace />}
        />
        <Route path="/documents/:id" element={<TextEditorWrapper />} />
      </Routes>
    </Router>
  );
}

function TextEditorWrapper() {
  const { id } = useParams();
  return <TextEditor documentId={id} />;
}

export default App;
