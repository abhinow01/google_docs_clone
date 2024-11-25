import React, { useCallback, useEffect, useRef, useState } from 'react';
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom"
const baseURL = import.meta.env.VITE_BASE_URL;
const SAVE_INTERVAL_MS = 1000;
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];

function TextEditor() {
  const { id: documentId } = useParams()
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);
  console.log(documentId);
  useEffect(() => {
    const s = io(baseURL);
    console.log("==s==" , s)
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(()=>{
    if(socket==null || quill == null ) return 

    socket.once("load-document", document =>{
      console.log("~load doc");
      quill.setContents(document);
      quill.enable()
    })

    socket.emit('get-document',documentId);

  },[socket,quill,documentId])

  useEffect(() => {
    if (socket == null || quill == null) return

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents())
    }, SAVE_INTERVAL_MS)

    return () => {
      clearInterval(interval)
    }
  }, [socket, quill])

  useEffect(()=>{
    if (socket==null || quill == null) return 
   const handler = (delta) =>{
      quill.updateContents(delta);
    };

    socket.on("recieve-changes", handler);

    return ()=>{
      socket.off('recieve-changes',handler)
    }

  },[socket,quill])


  useEffect(()=>{
    if (socket==null || quill == null) return 
   const handler = (delta, oldDelta, source) =>{
      if (source !== 'user') return 
      socket.emit("send-changes",delta);
    };

    quill.on("text-change", handler);

    return ()=>{
      quill.off('text-change',handler)
    }

  },[socket,quill])

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    wrapper.innerHTML = '';
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, { theme: "snow", modules: { toolbar: TOOLBAR_OPTIONS } });
    console.log(q);
    q.disable();
    q.setText('Loading...');
    setQuill(q);
  }, []);

  return (
    <div className='container' ref={wrapperRef}></div>
  );
}

export default TextEditor;
