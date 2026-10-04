/* contact.js: turns the form into a pre-filled WhatsApp message.
   There is no server: the browser opens wa.me with the text in the URL. */
(() => {
  // Digits only, with the country code and no "+".
  // TODO: confirm this number (your about page shows +231 657 19 35 20).
  const WHATSAPP_NUMBER = "231657193520";

  const form = document.getElementById("contact-form");
  if (!form) return;
  const status = form.querySelector(".form-status");

  // A native submit only fires when the browser's own validation passes
  // (required name, email and message, and a well-formed email address).
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data  = new FormData(form);
    const name  = String(data.get("name")).trim();
    const email = String(data.get("email")).trim();
    const phone = String(data.get("phone")).trim();
    const text  = String(data.get("subject")).trim();

    const lines = [`Hi Doua, I'm ${name}.`, "", text, "", `Email: ${email}`];
    if (phone) lines.push(`Phone: ${phone}`);

    // encodeURIComponent makes the text safe inside a URL (spaces, &, newlines...).
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;

    // Clicking a temporary link counts as part of the user's click, so popup
    // blockers allow it (window.open with "noopener" would also hide whether it worked).
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.append(link);
    link.click();
    link.remove();

    status.textContent = "Opening WhatsApp in a new tab…";
  });
})();