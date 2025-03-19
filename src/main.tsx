import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

// Certifique-se de que o elemento root existe
const rootElement = document.getElementById("root")

if (!rootElement) {
  const newRoot = document.createElement("div")
  newRoot.id = "root"
  document.body.appendChild(newRoot)

  console.log("Elemento root criado dinamicamente")

  ReactDOM.createRoot(newRoot).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} else {
  console.log("Elemento root encontrado")

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

