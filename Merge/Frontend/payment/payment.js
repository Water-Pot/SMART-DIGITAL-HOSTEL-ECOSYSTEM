const getToken = () => localStorage.getItem("jwtToken");
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const rawData = localStorage.getItem("pendingBookingInfo");
let bookingData = null;

// Load payment details from localStorage
document.addEventListener("DOMContentLoaded", () => {
  if (!rawData || !getToken()) {
    window.location.href = "/index.html";
    return;
  }
  bookingData = JSON.parse(rawData);
  document.getElementById("displayAmount").textContent =
    `৳ ${bookingData.amount}`;
  document.getElementById("displayUser").textContent = bookingData.userName;
  document.getElementById("displayRoom").textContent =
    `Room ${bookingData.roomNo}`;
  document.getElementById("displayMethod").textContent =
    bookingData.paymentMethod;
});

// Cancel — clear pending data and go back
function cancelPayment() {
  localStorage.removeItem("pendingBookingInfo");
  window.location.href = "/index.html";
}

// Confirm & Pay
async function processPayment() {
  const overlay = document.getElementById("processingOverlay");
  const overlayText = document.getElementById("overlayText");

  overlay.classList.remove("hidden");
  overlay.classList.add("flex");

  try {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // simulate processing
    overlayText.textContent = "Verifying Transaction...";

    const apiUrl =
      localStorage.getItem("paymentApiUrl") ||
      "http://localhost:8001/roomBooking/create";

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(bookingData),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Something went wrong!");
    }

    overlayText.textContent = "Payment Successful!";
    overlayText.classList.add("text-success");

    localStorage.removeItem("pendingBookingInfo");
    localStorage.removeItem("paymentApiUrl");

    setTimeout(() => {
      const returnUrl = localStorage.getItem("returnTo") || "/index.html";
      localStorage.removeItem("returnTo");
      window.location.href = returnUrl;
    }, 1500);
  } catch (error) {
    overlay.classList.add("hidden");
    overlay.classList.remove("flex");
    showToast(error.message, "error");
  }
}
