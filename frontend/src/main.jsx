import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {AuthProvider} from "./context/AuthContext";
import ThemeModeProvider from "./context/ThemeContext";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // CSS mặc định của toast

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <ThemeModeProvider>
        <AuthProvider>
          <App/>
          {/* 👇 Container hiển thị toast */}
          <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
          />
        </AuthProvider>
      </ThemeModeProvider>
    </React.StrictMode>
);
