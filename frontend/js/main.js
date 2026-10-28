const baseURL = "http://localhost:5000";

// 🧑‍💼 Admin login
async function adminLogin() {
  const username = document.getElementById("adminUser").value;
  const password = document.getElementById("adminPass").value;

  const res = await fetch(`${baseURL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();

  if (data.success) {
    alert("Admin login successful!");
    document.getElementById("adminDashboard").classList.remove("hidden");
  } else {
    alert("Invalid credentials");
  }
}

// 🧾 Load sponsors
async function loadSponsors() {
  const res = await fetch(`${baseURL}/get-sponsors`);
  const data = await res.json();

  const list = document.getElementById("sponsorList");
  list.innerHTML = "";
  data.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.name} (${s.email})`;
    list.appendChild(li);
  });
}

// 🧍 Sponsor registration
async function registerSponsor() {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const phone = document.getElementById("regPhone").value;
  const password = document.getElementById("regPass").value;

  const res = await fetch(`${baseURL}/sponsor/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, password }),
  });

  const data = await res.json();
  if (data.success) alert("Registered successfully!");
  else alert("Error registering sponsor");
}

// 🔑 Sponsor login
async function loginSponsor() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPass").value;

  const res = await fetch(`${baseURL}/sponsor/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();

  if (data.success) {
    document.getElementById("sponsorName").textContent = data.sponsor.name;
    document.getElementById("sponsorDashboard").classList.remove("hidden");
  } else {
    alert("Invalid credentials");
  }
}
