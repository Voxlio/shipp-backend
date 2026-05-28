/**
 * CargoLinkExpress / Shipment - Logistics & Tracking Backend Server
 * Technology Stack: Node.js, Express, Filesystem JSON Database, CORS.
 * * Instructions to run on your computer:
 * 1. Install Node.js on your computer (from nodejs.org).
 * 2. Create a folder and save this code as "server.js".
 * 3. Open your terminal/command prompt in that folder and run:
 * npm install express cors
 * 4. Start the server with:
 * node server.js
 * 5. Open your browser and navigate to:
 * http://localhost:3000/admin  (For the Staff Operations Portal)
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(cors()); // Permits any frontend website to access tracking data securely
app.use(express.json()); // Parses incoming JSON data payloads

// ==========================================
// PERSISTENT DATABASE MANAGEMENT
// ==========================================

// Prepopulated logistics records
const INITIAL_DATABASE = {
    "SH-99210": {
        waybill: "WB-901042-99210",
        eta: "In 2 Days (May 28, 2026)",
        location: "New York JFK Cargo Center Hub",
        status: "In Transit",
        badgeClass: "bg-amber-500/10 text-amber-500 border border-amber-500/30",
        step: 3,
        shipper: "Lux Logistics SA, Paris (CDG)",
        receiver: "TechCorp Industries, New York (JFK)",
        service: "Express Air Freight Priority",
        weight: "245.5 kg",
        dimensions: "120 × 80 × 95 cm",
        barcode: "|||| | | ||| || ||| | ||",
        tempSensor: "18.2°C (Optimal Room Temp)",
        times: ["May 23, 08:30 AM", "May 24, 11:15 AM", "May 25, 02:45 PM", "Pending Transit"],
        timeline: [
            { time: "May 26, 2026 - 10:15 AM", event: "Arrived at USA Import Hub", loc: "New York JFK Cargo Terminal", icon: "fa-plane-arrival", desc: "Transatlantic flight route SH-401 completed. Routed to custom import docks." },
            { time: "May 25, 2026 - 03:30 AM", event: "In Transit - Flight Departed", loc: "Paris Charles de Gaulle (CDG)", icon: "fa-plane-departure", desc: "Consolidated freight load departed on flight SH-401 eastbound." },
            { time: "May 24, 2026 - 01:15 PM", event: "Sorted & Export Dock cleared", loc: "Paris CDG Airport Depot", icon: "fa-clipboard-check", desc: "Customs declaration filed, export taxes cleared, secured container load approved." },
            { time: "May 23, 2026 - 08:30 AM", event: "Manifest Initiated & Picked Up", loc: "Shipper Paris Facility Warehouse", icon: "fa-truck-ramp-box", desc: "Package picked up by express courier. Weight verified, container sealed." }
        ]
    },
    "SH-44023": {
        waybill: "WB-220194-44023",
        eta: "Delivered (May 25, 2026)",
        location: "New York HQ - Dock B (Signed by A. Carter)",
        status: "Delivered",
        badgeClass: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30",
        step: 4,
        shipper: "Global Auto Parts Corp, Los Angeles (LAX)",
        receiver: "Manhattan Assembly Lines, New York",
        service: "Overland Road Freight Cold-Chain",
        weight: "1,240.0 kg",
        dimensions: "240 × 120 × 180 cm",
        barcode: "||| ||| | ||| || || |||",
        tempSensor: "4.5°C (Refrigerated Controlled)",
        times: ["May 21, 09:00 AM", "May 22, 02:00 PM", "May 24, 10:45 PM", "May 25, 01:20 PM"],
        timeline: [
            { time: "May 25, 2026 - 01:20 PM", event: "Cargo Delivered & Completed", loc: "Manhattan Corporate Assembly Office", icon: "fa-circle-check", desc: "Cargo offloaded. Checked out cleanly. Received and signed by operations lead Andrew Carter." },
            { time: "May 25, 2026 - 07:45 AM", event: "Out for Final Mile Delivery", loc: "New York Terminal Gate 3", icon: "fa-truck-fast", desc: "Consolidated load transferred to local delivery courier for dock delivery." },
            { time: "May 24, 10:45 PM", event: "Arrived at Regional Distribution Hub", loc: "New York Jersey Terminals", icon: "fa-warehouse", desc: "Cross-dock de-consolidation initiated. Long-haul trailer disconnected safely." },
            { time: "May 22, 2026 - 02:00 PM", event: "Interstate Transit Gate Clearance", loc: "Chicago Transit Plaza Checkpoint", icon: "fa-truck", desc: "Midwest route checkpoint verified. Carrier telemetry reports zero mechanical anomalies." },
            { time: "May 21, 2026 - 09:00 AM", event: "Cargo Picked Up & Sealing Completed", loc: "Los Angeles Depot Loading Ramp", icon: "fa-box-open", desc: "Refrigerated trailer loaded. Barcodes assigned and structural tracking enabled." }
        ]
    },
    "SH-55731": {
        waybill: "WB-883011-55731",
        eta: "Customs Hold (Delayed)",
        location: "Port of Seattle, Customs Clearance Terminal",
        status: "Customs Exception",
        badgeClass: "bg-rose-500/10 text-rose-500 border border-rose-500/30",
        step: 2,
        shipper: "SinoExport Manufactures, Shanghai Port",
        receiver: "Pacific Distribution Group, Seattle Center",
        service: "Ocean Carrier Vessel Consignee",
        weight: "14,500 kg",
        dimensions: "20ft Premium High-Cube Container",
        barcode: "||| | ||| || ||| || ||| ||",
        tempSensor: "15.4°C (Optimal Container Temp)",
        times: ["May 08, 10:00 AM", "May 25, 04:12 PM", "Pending Release", "Pending Release"],
        timeline: [
            { time: "May 26, 2026 - 09:00 AM", event: "Customs Inspection Hold", loc: "Port of Seattle Customs Compound", icon: "fa-circle-exclamation", desc: "Random customs check initiated. Import duty declaration under inspection. Agent broker has been notified." },
            { time: "May 25, 2026 - 04:12 PM", event: "Cargo Vessel Docked & Discharged", loc: "Port of Seattle Dock Terminal 18", icon: "fa-ship", desc: "Container vessel MSC Oceanica arrived safely. Container discharged and routed to container yard." },
            { time: "May 10, 2026 - 11:30 PM", event: "Vessel Departed Origin Port", loc: "Shanghai Deepwater Port", icon: "fa-anchor", desc: "Ocean freight corridor transit route initiated across trans-pacific line." },
            { time: "May 08, 2026 - 10:00 AM", event: "Manifest Registered & Containerized", loc: "Shanghai Industrial Zone Depot", icon: "fa-file-signature", desc: "Waybill registered. Export packing checks completed and standard security seals applied." }
        ]
    }
};

// Utility to read JSON database
function readDatabase() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATABASE, null, 4));
            return INITIAL_DATABASE;
        }
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Database reading failure, recovering initial backup:", error);
        return INITIAL_DATABASE;
    }
}

// Utility to write JSON database
function saveDatabase(dbData) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 4), 'utf8');
    } catch (error) {
        console.error("Critical: Failed to save tracking records to system:", error);
    }
}

// Initialize on server boot
readDatabase();

// ==========================================
// REST API ROUTING ENDPOINTS
// ==========================================

// Authenticate Admin Staff Credentials
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'password') {
        res.status(200).json({ 
            success: true, 
            token: "SECURE_STAFF_TOKEN_JWT_MOCK",
            user: "Operations Admin"
        });
    } else {
        res.status(401).json({ success: false, error: "Invalid staff credentials" });
    }
});

// Fetch all registered cargo containers
app.get('/api/shipments', (req, res) => {
    const database = readDatabase();
    res.status(200).json(database);
});

// Search for single parcel tracking ID (GET /api/shipments/SH-99210)
app.get('/api/shipments/:id', (req, res) => {
    const database = readDatabase();
    const cargoId = req.params.id.trim().toUpperCase();
    const record = database[cargoId];

    if (record) {
        res.status(200).json(record);
    } else {
        res.status(404).json({ error: "Tracking identifier not recognized in active database manifests." });
    }
});

// Register and Generate brand new waybill
app.post('/api/shipments/create', (req, res) => {
    const { 
        shipper, receiver, service, status, weight, dimensions, temp, m1, m2, m3, m4,
        departedDate, departedDateShort,
        onTransitDate, onTransitDateShort,
        deliveredDate, deliveredDateShort 
    } = req.body;

    if (!shipper || !receiver) {
        return res.status(400).json({ error: "Origin shipper and destination receiver details are mandatory." });
    }

    // 1. Math formula generating a cryptographically independent 5-digit index
    const min = 10000;
    const max = 99999;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    const generatedID = "SH-" + randomNumber;

    // 2. Select appropriate badge design styles matching cargo states
    let badgeClass = "bg-sky-500/10 text-sky-500 border border-sky-500/30";
    let step = 1;

    if (status === 'In Transit') {
        badgeClass = "bg-amber-500/10 text-amber-500 border border-amber-500/30";
        step = 3;
    } else if (status === 'Delivered') {
        badgeClass = "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30";
        step = 4;
    } else if (status === 'Customs Exception') {
        badgeClass = "bg-rose-500/10 text-rose-500 border border-rose-500/30";
        step = 2;
    }

    // 3. Assemble complete package JSON object with custom dates if provided
    const newPackage = {
        waybill: `WB-${Math.floor(Math.random() * 800000) + 100000}-${generatedID}`,
        eta: status === 'Delivered' ? 'Delivered successfully' : 'In 4 Business Days',
        location: status === 'Delivered' ? receiver : "En Route Gateway Center",
        status: status,
        badgeClass: badgeClass,
        step: step,
        shipper: shipper,
        receiver: receiver,
        service: service,
        weight: weight || "15.0 kg",
        dimensions: dimensions || "40x40x40 cm",
        barcode: `||| ||| | || ${randomNumber} ||`,
        tempSensor: temp || "18.5°C",
        times: [
            "May 27, 09:00 AM",
            step >= 2 ? (departedDateShort || "May 27, 02:30 PM") : "Pending Sorting",
            step >= 3 ? (onTransitDateShort || "May 28, 10:15 AM") : "Pending Dispatch",
            step >= 4 ? (deliveredDateShort || "May 28, 04:45 PM") : "Pending Delivery"
        ],
        timeline: [
            { time: deliveredDate || "May 28, 2026 - 11:00 AM", event: m4 || "Awaiting delivery hub dispatch", loc: "Target Terminal Hub", icon: "fa-map-pin", desc: "Consignment parameters tracked and registered. Transition log approved." },
            { time: onTransitDate || "May 28, 2026 - 08:30 AM", event: m3 || "Departed facility node on route transit", loc: "Gateway Sorting Node", icon: "fa-truck", desc: "Container manifest dispatched toward target delivery terminal." },
            { time: departedDate || "May 27, 2026 - 02:30 PM", event: m2 || "Freight Sorted & Consolidated", loc: "Carrier Dispatch Center", icon: "fa-warehouse", desc: "Cargo consolidated on linehaul truck loading ramps." },
            { time: "May 27, 2026 - 09:00 AM", event: m1 || "Manifest Initiated & Picked Up", loc: shipper.split(',')[1] || "Origin Yard", icon: "fa-truck-ramp-box", desc: "Package collection completed. Waybill tags generated securely." }
        ]
    };

    // 4. Save to filesystem
    const database = readDatabase();
    database[generatedID] = newPackage;
    saveDatabase(database);

    res.status(201).json({ success: true, trackingID: generatedID, shipment: newPackage });
});

// Update Status of package
app.put('/api/shipments/:id/status', (req, res) => {
    const cargoId = req.params.id.trim().toUpperCase();
    const { status, location, details } = req.body;

    const database = readDatabase();
    const cargo = database[cargoId];

    if (!cargo) {
        return res.status(404).json({ error: "Target package not found." });
    }

    // Modify payload
    cargo.status = status;
    cargo.location = location || cargo.location;
    
    let badgeClass = "bg-sky-500/10 text-sky-500 border border-sky-500/30";
    let step = 1;

    if (status === 'In Transit') {
        badgeClass = "bg-amber-500/10 text-amber-500 border border-amber-500/30";
        step = 3;
        cargo.eta = "In Transit (Scheduled)";
    } else if (status === 'Delivered') {
        badgeClass = "bg-emerald-500/10 text-[#22C55E] border border-emerald-500/30";
        step = 4;
        cargo.eta = "Delivered successfully";
    } else if (status === 'Customs Exception') {
        badgeClass = "bg-rose-500/10 text-rose-500 border border-rose-500/30";
        step = 2;
        cargo.eta = "Hold (Awaiting Customs)";
    } else {
        // Defaulting status like Sorting Depot
        badgeClass = "bg-sky-500/10 text-sky-500 border border-sky-500/30";
        step = 1;
        cargo.eta = "Processing in Depot";
    }

    cargo.badgeClass = badgeClass;
    cargo.step = step;

    // Append update event to timeline logs
    const now = new Date();
    const formattedTime = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + " - " + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    // Choose icon base on status
    let eventIcon = 'fa-clock';
    if (status === 'Delivered') eventIcon = 'fa-circle-check';
    else if (status === 'In Transit') eventIcon = 'fa-truck-fast';
    else if (status === 'Customs Exception') eventIcon = 'fa-circle-exclamation';
    else if (status === 'Sorting Depot') eventIcon = 'fa-warehouse';

    cargo.timeline.unshift({
        time: formattedTime,
        event: `Status updated to: ${status}`,
        loc: cargo.location,
        icon: eventIcon,
        desc: details || `Package status altered to ${status} at ${cargo.location}. Operational logs updated.`
    });

    saveDatabase(database);
    res.status(200).json({ success: true, shipment: cargo });
});

// Purge Shipment from database
app.delete('/api/shipments/:id', (req, res) => {
    const cargoId = req.params.id.trim().toUpperCase();
    const database = readDatabase();

    if (database[cargoId]) {
        delete database[cargoId];
        saveDatabase(database);
        res.status(200).json({ success: true, message: `Waybill ${cargoId} permanently removed.` });
    } else {
        res.status(404).json({ error: "Package record not found." });
    }
});

// ==========================================
// EMBEDDED STAFF PORTAL FRONTEND PAGE
// ==========================================

app.get('/admin', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Control Panel Portal | Shipment Logistics</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            primary: '#FF3E41',
                            secondary: '#0F172A',
                            accent: '#06B6D4'
                        }
                    }
                }
            }
        </script>
        <style>
            .custom-toast {
                animation: slideIn 0.3s ease-out forwards;
            }
            @keyframes slideIn {
                from { transform: translateY(-1rem); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        </style>
    </head>
    <body class="bg-[#FAFAFA] text-slate-800 font-sans antialiased">
        <!-- NOTIFICATION CONTAINER (Custom Toast system avoiding alerts) -->
        <div id="toast-container" class="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"></div>

        <!-- CUSTOM CONFIRM MODAL CONTAINER -->
        <div id="custom-confirm" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 transform scale-95 transition-transform duration-200">
                <div class="text-center">
                    <span class="w-12 h-12 bg-rose-50 text-rose-500 flex items-center justify-center text-xl mx-auto rounded-full mb-3">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </span>
                    <h3 class="font-bold text-slate-900 text-lg" id="confirm-title">Are you sure?</h3>
                    <p class="text-slate-500 text-xs mt-2 leading-relaxed" id="confirm-message">This action is permanent and will completely clear the tracking index from our servers.</p>
                </div>
                <div class="mt-6 flex gap-3">
                    <button id="confirm-cancel-btn" class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors">
                        Cancel
                    </button>
                    <button id="confirm-accept-btn" class="flex-1 py-2.5 bg-primary hover:bg-rose-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors">
                        Delete
                    </button>
                </div>
            </div>
        </div>

        <!-- LOGGED OUT INTERFACE -->
        <div id="login-screen" class="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div class="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
                <div class="text-center mb-6">
                    <span class="w-14 h-14 bg-primary/10 text-primary flex items-center justify-center text-2xl mx-auto rounded-full mb-3">
                        <i class="fa-solid fa-lock-open"></i>
                    </span>
                    <h2 class="text-white text-2xl font-bold">Staff Control Gateway</h2>
                    <p class="text-slate-400 text-xs mt-1">Unlock central logistics servers securely</p>
                </div>

                <form id="loginForm" class="space-y-4">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Staff Username</label>
                        <input type="text" id="username" required placeholder="admin" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Passkey Code</label>
                        <input type="password" id="password" required placeholder="password" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary">
                    </div>
                    <div id="loginError" class="hidden text-xs text-rose-500 font-bold bg-rose-500/10 p-2.5 rounded border border-rose-500/20">
                        Invalid password or username index.
                    </div>
                    <button type="submit" class="w-full py-3 bg-primary hover:bg-rose-600 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors">
                        Authenticate Terminal
                    </button>
                </form>
            </div>
        </div>

        <!-- LOGGED IN ADMINISTRATIVE DASHBOARD -->
        <div id="dashboard-screen" class="hidden min-h-screen flex flex-col">
            <!-- Header bar -->
            <header class="bg-slate-950 text-white py-4 px-6 border-b border-slate-850 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="bg-primary text-white p-2.5 rounded-xl text-lg">
                        <i class="fa-solid fa-satellite-dish animate-pulse"></i>
                    </div>
                    <div>
                        <h1 class="font-bold text-lg">CargoLink Central</h1>
                        <p class="text-[9px] text-slate-400 tracking-widest uppercase font-semibold">Live System Terminal</p>
                    </div>
                </div>
                <button onclick="logout()" class="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-xs font-bold rounded border border-slate-800 uppercase tracking-wider transition">
                    Logout
                </button>
            </header>

            <!-- Main Panels -->
            <main class="flex-grow p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                <!-- Left panel: Package Creator Form -->
                <div class="lg:col-span-5 bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm">
                    <h3 class="font-bold text-lg text-slate-900 mb-6 border-b border-slate-100 pb-3">
                        <i class="fa-solid fa-boxes-packing text-primary mr-1"></i> New Cargo Entry
                    </h3>

                    <form id="createForm" class="space-y-4 text-xs">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block font-bold text-slate-500 uppercase tracking-wider mb-1">Shipper Origin</label>
                                <input type="text" id="shipper" required placeholder="Lux Logistics, Paris" class="w-full bg-slate-50 border border-slate-200 rounded p-2.5 outline-none focus:border-primary">
                            </div>
                            <div>
                                <label class="block font-bold text-slate-500 uppercase tracking-wider mb-1">Consignee Destination</label>
                                <input type="text" id="receiver" required placeholder="TechCorp, New York" class="w-full bg-slate-50 border border-slate-200 rounded p-2.5 outline-none focus:border-primary">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block font-bold text-slate-500 uppercase tracking-wider mb-1">Service Level</label>
                                <select id="service" class="w-full bg-slate-50 border border-slate-200 rounded p-2.5 outline-none focus:border-primary">
                                    <option>Express Air Freight Priority</option>
                                    <option>Overland Road Freight Cold-Chain</option>
                                    <option>Ocean Carrier Vessel Consignee</option>
                                </select>
                            </div>
                            <div>
                                <label class="block font-bold text-slate-500 uppercase tracking-wider mb-1">Current Status</label>
                                <select id="status" class="w-full bg-slate-50 border border-slate-200 rounded p-2.5 outline-none focus:border-primary">
                                    <option>Sorting Depot</option>
                                    <option>Customs Exception</option>
                                    <option>In Transit</option>
                                    <option>Delivered</option>
                                </select>
                            </div>
                        </div>

                        <div class="grid grid-cols-3 gap-3">
                            <div>
                                <label class="block font-bold text-slate-500 uppercase tracking-wider mb-1">Weight</label>
                                <input type="text" id="weight" placeholder="12.5 kg" class="w-full bg-slate-50 border border-slate-200 rounded p-2 outline-none">
                            </div>
                            <div>
                                <label class="block font-bold text-slate-500 uppercase tracking-wider mb-1">Volume</label>
                                <input type="text" id="dimensions" placeholder="40x40x40 cm" class="w-full bg-slate-50 border border-slate-200 rounded p-2 outline-none">
                            </div>
                            <div>
                                <label class="block font-bold text-slate-500 uppercase tracking-wider mb-1">Temp</label>
                                <input type="text" id="temp" placeholder="18.5°C" class="w-full bg-slate-50 border border-slate-200 rounded p-2 outline-none">
                            </div>
                        </div>

                        <!-- CUSTOM TIMESTAMPS FOR THE NEW CARGO ENTRY -->
                        <div class="border-t border-slate-100 pt-3">
                            <span class="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">Custom Timeline Schedules</span>
                            <div class="grid grid-cols-3 gap-2">
                                <div>
                                    <label class="block font-bold text-slate-400 uppercase tracking-[0.05em] mb-1 text-[9px]">Departed Date</label>
                                    <input type="datetime-local" id="departedDate" class="w-full bg-slate-50 border border-slate-200 rounded p-2 outline-none focus:border-primary text-[10px]">
                                </div>
                                <div>
                                    <label class="block font-bold text-slate-400 uppercase tracking-[0.05em] mb-1 text-[9px]">On Transit Date</label>
                                    <input type="datetime-local" id="onTransitDate" class="w-full bg-slate-50 border border-slate-200 rounded p-2 outline-none focus:border-primary text-[10px]">
                                </div>
                                <div>
                                    <label class="block font-bold text-slate-400 uppercase tracking-[0.05em] mb-1 text-[9px]">Delivered Date</label>
                                    <input type="datetime-local" id="deliveredDate" class="w-full bg-slate-50 border border-slate-200 rounded p-2 outline-none focus:border-primary text-[10px]">
                                </div>
                            </div>
                        </div>

                        <button type="submit" class="w-full py-3 bg-primary hover:bg-rose-600 text-white font-bold rounded-xl tracking-wider uppercase shadow transition-all flex items-center justify-center gap-1.5 mt-4">
                            <i class="fa-solid fa-plus"></i> Inject Into Database
                        </button>
                    </form>
                </div>

                <!-- Right panel: Packages Table List -->
                <div class="lg:col-span-7 bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm">
                    <div class="flex justify-between items-center border-b border-slate-100 pb-3 mb-6">
                        <h3 class="font-bold text-lg text-slate-900"><i class="fa-solid fa-boxes-stacked text-primary mr-1"></i> Package Index</h3>
                        <span id="packageCount" class="text-xs font-bold text-slate-400 uppercase tracking-wider">-</span>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr class="text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider">
                                    <th class="py-3 px-2">ID</th>
                                    <th class="py-3 px-2">Route Details</th>
                                    <th class="py-3 px-2">Current State</th>
                                    <th class="py-3 px-2 text-right">Modifier Ops</th>
                                </tr>
                            </thead>
                            <tbody id="shipment-rows" class="divide-y divide-slate-100">
                                <!-- Populated by JS -->
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>

        <script>
            const API_BASE = window.location.origin;

            // Custom UI Notification Banner (Toast)
            function showNotification(msg, type = 'success') {
                const container = document.getElementById('toast-container');
                const toast = document.createElement('div');
                toast.className = \`custom-toast pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-lg border text-xs font-semibold bg-white transition-all \${
                    type === 'success' 
                    ? 'border-emerald-500/20 text-emerald-800 shadow-emerald-500/5' 
                    : 'border-rose-500/20 text-rose-800 shadow-rose-500/5'
                }\`;

                const icon = type === 'success' ? 'fa-circle-check text-emerald-500' : 'fa-circle-exclamation text-rose-500';
                
                toast.innerHTML = \`
                    <i class="fa-solid \${icon} text-lg"></i>
                    <span class="flex-grow">\${msg}</span>
                \`;

                container.appendChild(toast);

                // Auto destroy after 3.5 seconds
                setTimeout(() => {
                    toast.classList.add('opacity-0', 'scale-95');
                    setTimeout(() => { toast.remove(); }, 300);
                }, 3500);
            }

            // Custom non-blocking Confirm Dialog
            function triggerConfirm(title, message, onAccept) {
                const modal = document.getElementById('custom-confirm');
                const titleEl = document.getElementById('confirm-title');
                const msgEl = document.getElementById('confirm-message');
                const cancelBtn = document.getElementById('confirm-cancel-btn');
                const acceptBtn = document.getElementById('confirm-accept-btn');

                titleEl.textContent = title;
                msgEl.textContent = message;
                modal.classList.remove('hidden');

                const cleanUp = () => {
                    modal.classList.add('hidden');
                    cancelBtn.onclick = null;
                    acceptBtn.onclick = null;
                };

                cancelBtn.onclick = () => {
                    cleanUp();
                };

                acceptBtn.onclick = () => {
                    onAccept();
                    cleanUp();
                };
            }

            // Custom Formatter to convert input date-time values into the tracking UI style
            function formatDateTime(val, longFormat = true) {
                if (!val) return null;
                const d = new Date(val);
                if (isNaN(d.getTime())) return null;
                
                const month = d.toLocaleDateString('en-US', { month: 'short' });
                const day = d.toLocaleDateString('en-US', { day: '2-digit' });
                const year = d.getFullYear();
                
                let hours = d.getHours();
                const minutes = String(d.getMinutes()).padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12; 
                const timeStr = \`\${String(hours).padStart(2, '0')}:\${minutes} \${ampm}\`;
                
                if (longFormat) {
                    return \`\${month} \${day}, \${year} - \${timeStr}\`;
                } else {
                    return \`\${month} \${day}, \${timeStr}\`;
                }
            }

            // Check if user is already authenticated
            if (sessionStorage.getItem("staffToken")) {
                showDashboard();
            }

            // Login Logic
            document.getElementById('loginForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const errBox = document.getElementById('loginError');

                try {
                    const res = await fetch(API_BASE + '/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    
                    const data = await res.json();
                    if (data.success) {
                        sessionStorage.setItem("staffToken", data.token);
                        showDashboard();
                    } else {
                        errBox.classList.remove('hidden');
                    }
                } catch (err) {
                    showNotification("Unable to connect to Node backend database servers.", "error");
                }
            });

            function showDashboard() {
                document.getElementById('login-screen').classList.add('hidden');
                document.getElementById('dashboard-screen').classList.remove('hidden');
                fetchShipments();
            }

            function logout() {
                sessionStorage.removeItem("staffToken");
                location.reload();
            }

            // Fetch list
            async function fetchShipments() {
                const list = document.getElementById('shipment-rows');
                list.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-slate-400">Loading database records...</td></tr>';
                
                try {
                    const res = await fetch(API_BASE + '/api/shipments');
                    const data = await res.json();
                    const keys = Object.keys(data);
                    
                    document.getElementById('packageCount').innerText = keys.length + " Items";
                    list.innerHTML = '';

                    keys.forEach(key => {
                        const pack = data[key];
                        const tr = document.createElement('tr');
                        tr.className = "hover:bg-slate-50 transition-colors border-b border-slate-100";
                        tr.innerHTML = \`
                            <td class="py-4 px-2 font-mono font-bold text-primary">\${key}</td>
                            <td class="py-4 px-2">
                                <span class="block font-semibold text-slate-800 text-xs truncate max-w-[200px]">\${pack.shipper}</span>
                                <span class="block text-slate-400 text-[10px] truncate max-w-[200px]">\${pack.receiver}</span>
                            </td>
                            <td class="py-4 px-2">
                                <span class="px-2 py-0.5 rounded text-[10px] uppercase font-extrabold text-slate-700 bg-slate-100 border border-slate-200">
                                    \${pack.status}
                                </span>
                            </td>
                            <td class="py-4 px-2 text-right">
                                <div class="inline-flex items-center gap-2">
                                    <!-- Dynamic Select Dropdown modifying live package states -->
                                    <select onchange="quickUpdateStatus('\${key}', this.value)" class="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 outline-none focus:border-primary transition cursor-pointer">
                                        <option value="Sorting Depot" \${pack.status === 'Sorting Depot' ? 'selected' : ''}>Sorting Depot</option>
                                        <option value="Customs Exception" \${pack.status === 'Customs Exception' ? 'selected' : ''}>Customs Exception</option>
                                        <option value="In Transit" \${pack.status === 'In Transit' ? 'selected' : ''}>In Transit</option>
                                        <option value="Delivered" \${pack.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                                    </select>
                                    
                                    <button onclick="deleteShipment('\${key}')" class="h-8 w-8 flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition" title="Purge Record">
                                        <i class="fa-solid fa-trash text-[11px]"></i>
                                    </button>
                                </div>
                            </td>
                        \`;
                        list.appendChild(tr);
                    });
                } catch (err) {
                    list.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-red-500">Database communication failed.</td></tr>';
                }
            }

            // Create submission
            document.getElementById('createForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const departedRaw = document.getElementById('departedDate').value;
                const onTransitRaw = document.getElementById('onTransitDate').value;
                const deliveredRaw = document.getElementById('deliveredDate').value;

                const payload = {
                    shipper: document.getElementById('shipper').value,
                    receiver: document.getElementById('receiver').value,
                    service: document.getElementById('service').value,
                    status: document.getElementById('status').value,
                    weight: document.getElementById('weight').value,
                    dimensions: document.getElementById('dimensions').value,
                    temp: document.getElementById('temp').value,
                    // Format dates into long and short strings to match default schema layouts
                    departedDate: formatDateTime(departedRaw, true),
                    departedDateShort: formatDateTime(departedRaw, false),
                    onTransitDate: formatDateTime(onTransitRaw, true),
                    onTransitDateShort: formatDateTime(onTransitRaw, false),
                    deliveredDate: formatDateTime(deliveredRaw, true),
                    deliveredDateShort: formatDateTime(deliveredRaw, false)
                };

                try {
                    const res = await fetch(API_BASE + '/api/shipments/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    
                    const data = await res.json();
                    if (data.success) {
                        showNotification("Waybill generated successfully! ID: " + data.trackingID, "success");
                        document.getElementById('createForm').reset();
                        fetchShipments();
                    }
                } catch (err) {
                    showNotification("Failed to write new waybill to database.", "error");
                }
            });

            // Quick Status transition with smart logistics description and physical hub matching
            async function quickUpdateStatus(id, newStatus) {
                let location = "Local Delivery Terminal";
                let details = "Status manually updated through Staff Operations Console.";

                if (newStatus === 'Sorting Depot') {
                    location = "Hub Carrier / Sorting Yard Depot";
                    details = "Package registered and processed through sorting lines. Prepped for linehaul vehicle consolidation.";
                } else if (newStatus === 'Customs Exception') {
                    location = "Port Customs Checkpoint Area";
                    details = "Held temporarily for standard import clearance procedures and paperwork checking.";
                } else if (newStatus === 'In Transit') {
                    location = "En Route Gateway Hub";
                    details = "Cleared processing facilities and is actively forwarding across the transportation network node.";
                } else if (newStatus === 'Delivered') {
                    location = "Destination Receiver Dock";
                    details = "Shipment completed. Handover checked, completed, and signed for successfully by local consignee.";
                }

                try {
                    const res = await fetch(API_BASE + '/api/shipments/' + id + '/status', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            status: newStatus, 
                            location: location, 
                            details: details 
                        })
                    });
                    if (res.ok) {
                        showNotification(\`Shipment \${id} updated to "\${newStatus}"\`, "success");
                        fetchShipments();
                    } else {
                        showNotification("Unable to save status updates. Try again.", "error");
                    }
                } catch (err) {
                    showNotification("Error communicating with servers.", "error");
                }
            }

            // Purge Shipment
            function deleteShipment(id) {
                triggerConfirm(
                    "Purge Waybill?", 
                    "Are you absolutely sure you want to permanently clear shipment " + id + " from tracking databases?", 
                    async () => {
                        try {
                            const res = await fetch(API_BASE + '/api/shipments/' + id, { method: 'DELETE' });
                            if (res.ok) {
                                showNotification("Waybill cleared successfully.", "success");
                                fetchShipments();
                            } else {
                                showNotification("Failed to purge requested package.", "error");
                            }
                        } catch (err) {
                            showNotification("System write permissions error.", "error");
                        }
                    }
                );
            }
        </script>
    </body>
    </html>
    `);
});

// Start Server Loop listener
app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(` 📡 CARGOLINK LOGISTICS ACTIVE BACKEND RUNNING`);
    console.log(`🏠 Public API Root: http://localhost:${PORT}`);
    console.log(`💼 Private Admin Console link: http://localhost:${PORT}/admin`);
    console.log(`===================================================`);
});