const BUSINESS_WHATSAPP_NUMBER = "919630589519"; // Balaji business WhatsApp number, digits only

const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

menuToggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menuToggle.textContent = open ? "×" : "☰";
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    if (menuToggle) {
      menuToggle.textContent = "☰";
      menuToggle.setAttribute("aria-label", "Open menu");
    }
  });
});

const filterButtons = document.querySelectorAll(".filter");
const cards = document.querySelectorAll(".product-card");

function setFilter(filter) {
  filterButtons.forEach((button) => button.classList.toggle("active", button.dataset.filter === filter));
  cards.forEach((card) => {
    card.hidden = filter !== "all" && card.dataset.category !== filter;
  });
}

filterButtons.forEach((button) => button.addEventListener("click", () => setFilter(button.dataset.filter)));

document.querySelectorAll("[data-jump-filter]").forEach((link) => {
  link.addEventListener("click", () => setFilter(link.dataset.jumpFilter));
});

document.querySelectorAll(".enquire-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const product = button.dataset.product || "Product enquiry";
    const message = `Hello Balaji Corian Home Decor, I would like to enquire about: ${product}. Please share availability and details.`;
    window.open(`https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  });
});

document.getElementById("contactForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const name = String(data.get("name") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  const type = String(data.get("customerType") || "").trim();
  const interest = String(data.get("interest") || "").trim();
  const message = String(data.get("message") || "").trim();

  if (!name || !phone) {
    document.getElementById("formNote").textContent = "Please enter your name and phone number.";
    return;
  }

  const whatsappText = [
    "Hello Balaji Corian Home Decor,",
    "",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Customer type: ${type}`,
    `Product category: ${interest}`,
    message ? `Requirement: ${message}` : "",
    "",
    "Please contact me with more details."
  ].filter(Boolean).join("\n");

  // Save to MongoDB API when it is running; WhatsApp remains the visitor's direct contact option.
  // Open WhatsApp immediately so browser popup blockers do not block it after an async request.
  const whatsappWindow = window.open(`https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`, "_blank");
  const note = document.getElementById("formNote");
  note.textContent = "WhatsApp is opening. Please press Send in WhatsApp to submit your message.";
 fetch("/api/enquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone, customerType: type, interest, message })
  }).then(async response => {
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "API unavailable");
    note.textContent = "Enquiry saved to the database. Please also press Send in WhatsApp if you want to contact us there.";
  }).catch(() => {
    note.textContent = "WhatsApp is opening. Press Send in WhatsApp; database saving works after the API and MongoDB are configured.";
  });
});

document.getElementById("year").textContent = new Date().getFullYear();
