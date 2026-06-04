const EMAILJS_PUBLIC_KEY   = "L9txfNtHh94xOyt7Y";    // Account → API Keys
const EMAILJS_SERVICE_ID   = "service_bw7oxzg";    // Email Services → Service ID
const EMAILJS_TEMPLATE_ID  = "template_e4xl2rt";   // Email Templates → Template ID

// ── Init EmailJS ───────────────────────────────────────────
emailjs.init(EMAILJS_PUBLIC_KEY);

// ── Form handler ───────────────────────────────────────────
const form      = document.getElementById("contactForm");
const btnSend   = document.getElementById("btnSend");
const btnLabel  = document.getElementById("btnLabel");
const formStatus = document.getElementById("formStatus");

function setStatus(msg, isError = false) {
  formStatus.textContent = msg;
  formStatus.style.color = isError
    ? "#ff6b6b"
    : "var(--color-text-accent)";
}

function setLoading(loading) {
  btnSend.disabled = loading;
  btnLabel.innerHTML = loading
    ? `Sending <i class="fa-solid fa-circle-notch fa-spin"></i>`
    : `Send Message <i class="fa-solid fa-paper-plane"></i>`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus("");
  setLoading(true);

  const templateParams = {
    from_name   : document.getElementById("contactName").value.trim(),
    from_email  : document.getElementById("contactEmail").value.trim(),
    subject     : document.getElementById("contactSubject").value.trim(),
    message     : document.getElementById("contactMessage").value.trim(),
  };

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
    setStatus("✓ Message sent! I'll get back to you within 24 hours.");
    form.reset();
  } catch (err) {
    console.error("EmailJS error:", err);
    setStatus("✗ Something went wrong. Please try emailing me directly at theartjooste0@gmail.com", true);
  } finally {
    setLoading(false);
  }
});