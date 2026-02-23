// 1. IMPORTACIÓN DE FIREBASE (Vía CDN para que funcione en el navegador)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// TUS CREDENCIALES
const firebaseConfig = {
  apiKey: "AIzaSyAxFWpU-DZ8l5xoI690xkIA4GeksIQxPEs",
  authDomain: "solaris-rp.firebaseapp.com",
  databaseURL: "https://solaris-rp-default-rtdb.firebaseio.com",
  projectId: "solaris-rp",
  storageBucket: "solaris-rp.firebasestorage.app",
  messagingSenderId: "374557175140",
  appId: "1:374557175140:web:ea8c4bf22b1c2686d09e71",
  measurementId: "G-G2XY19Y3H1"
};

// Inicializar
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const staffRef = ref(db, 'staff');

// --- ACCESO ADMIN ---
const MI_USUARIO = "admin";
const MI_CLAVE = "1234";

// Esto "saca" las funciones del módulo para que el botón las vea
window.intentarEntrar = intentarEntrar;
window.logout = logout;
window.addStaff = addStaff;
window.removeStaff = removeStaff;

function intentarEntrar() {
    const u = document.getElementById('AUTH_USER').value.trim();
    const p = document.getElementById('AUTH_PASS').value.trim();
    if (u === MI_USUARIO && p === MI_CLAVE) {
        sessionStorage.setItem("logueado", "true");
        alert("¡Acceso concedido!");
        location.reload();
    } else {
        alert("Datos incorrectos.");
    }
}

function logout() {
    sessionStorage.removeItem("logueado");
    location.reload();
}

// --- GESTIÓN DE STAFF (FIREBASE) ---
function addStaff() {
    const name = document.getElementById('staffName').value;
    const range = document.getElementById('staffRange').value;
    const img = document.getElementById('staffImg').value;

    if (!name || !img) return alert("Faltan datos");

    push(staffRef, { name, range, img });

    document.getElementById('staffName').value = '';
    document.getElementById('staffImg').value = '';
}

function removeStaff(idFirebase) {
    if (confirm("¿Eliminar miembro de la nube?")) {
        const itemRef = ref(db, `staff/${idFirebase}`);
        remove(itemRef);
    }
}

// --- RENDERIZADO EN TIEMPO REAL ---
onValue(staffRef, (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById('staffList');
    const esAdmin = sessionStorage.getItem("logueado") === "true";
    const counter = document.getElementById('counter');

    if(!container) return;

    if (!data) {
        container.innerHTML = "<p style='color:white;'>No hay staff registrado.</p>";
        if(counter) counter.innerText = "0 Miembros";
        return;
    }

    let total = 0;
    let html = "";
    
    Object.keys(data).forEach(id => {
        const s = data[id];
        total++;
        html += `
            <div class="staff-card-pro">
                <img src="${s.img}" onerror="this.src='https://via.placeholder.com/80'">
                <div class="badge-pro">${s.range.toUpperCase()}</div>
                <h3>${s.name}</h3>
                ${esAdmin ? `<button class="btn-delete" onclick="removeStaff('${id}')">Eliminar</button>` : ''}
            </div>
        `;
    });

    container.innerHTML = html;
    if(counter) counter.innerText = `${total} Miembros`;
});

// Control de vista
window.addEventListener('load', () => {
    const sesion = sessionStorage.getItem("logueado");
    const panel = document.getElementById('adminPanel');
    const loginBox = document.getElementById('loginSection');

    if (sesion === "true") {
        if(panel) panel.style.display = "block";
        if(loginBox) loginBox.style.display = "none";
    }
});

// Este código conecta el botón con la función de login automáticamente
document.addEventListener('DOMContentLoaded', () => {
    const boton = document.getElementById('btnEntrar');
    if (boton) {
        boton.addEventListener('click', () => {
            // Llamamos a la función intentarEntrar que ya tienes en el JS
            intentarEntrar(); 
        });
    }
});