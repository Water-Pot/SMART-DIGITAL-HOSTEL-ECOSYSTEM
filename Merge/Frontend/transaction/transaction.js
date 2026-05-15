// Revenue + transaction stats helper
const extractMoney = (obj) => {
  if (!obj) return 0;
  if (obj.transaction?.amount) return Number(obj.transaction.amount);
  if (typeof obj.amount === "number") return Number(obj.amount);
  if (obj.totalAmount) return Number(obj.totalAmount);
  if (obj.price) return Number(obj.price);
  let maxAmt = 0;
  const search = (o) => {
    if (!o || typeof o !== "object") return;
    for (let k in o) {
      const key = k.toLowerCase();
      if (
        (key.includes("amount") ||
          key.includes("price") ||
          key.includes("fee")) &&
        typeof o[k] === "number"
      ) {
        if (
          ![
            "tokenamount",
            "availableseat",
            "totalseat",
            "floorno",
            "roomno",
            "id",
          ].includes(key)
        ) {
          if (o[k] > maxAmt) maxAmt = o[k];
        }
      } else if (typeof o[k] === "object" && o[k] !== null) {
        search(o[k]);
      }
    }
  };
  search(obj);
  return maxAmt;
};

// Load dashboard revenue stats
async function loadDashboardStats() {
  try {
    const [u, r, t, b] = await Promise.all([
      fetch("http://localhost:8001/user/all", { headers: getHeaders() }).then(
        parseData,
      ),
      fetch("http://localhost:8001/room/get/all", {
        headers: getHeaders(),
      }).then(parseData),
      fetch("http://localhost:8001/mealToken/get/all", {
        headers: getHeaders(),
      }).then(parseData),
      fetch("http://localhost:8001/roomBooking/get/all", {
        headers: getHeaders(),
      }).then(parseData),
    ]);

    let tokenRev = 0,
      tokenCount = 0,
      tokenSold = 0;
    t.forEach((x) => {
      if (!x) return;
      tokenCount++;
      tokenSold += Number(x.tokenAmount || 0);
      tokenRev += extractMoney(x);
    });

    let roomRev = 0,
      roomCount = 0;
    b.forEach((x) => {
      if (!x) return;
      roomCount++;
      roomRev += extractMoney(x);
    });

    document.getElementById("statTotalRooms").innerText = r.length;
    document.getElementById("statAvailableRooms").innerText =
      `${r.filter((x) => x && !x.occupied).length} Available`;
    document.getElementById("statTotalTokens").innerText = tokenSold;
    document.getElementById("statTokenRev").innerText =
      "৳ " + tokenRev.toFixed(2);
    document.getElementById("statTokenTx").innerText =
      tokenCount + " Transactions";
    document.getElementById("statRoomRev").innerText =
      "৳ " + roomRev.toFixed(2);
    document.getElementById("statRoomTx").innerText =
      roomCount + " Transactions";
    document.getElementById("statTotalRev").innerText =
      "৳ " + (tokenRev + roomRev).toFixed(2);
    document.getElementById("statTotalTx").innerText =
      tokenCount + roomCount + " Total Transactions";
    document.getElementById("statTotalTenants").innerText = u.length;
  } catch (e) {}
}

// View all token sales (admin)
async function openViewAllTokensModal() {
  all_tokens_list_modal.showModal();
  const tbody = document.getElementById("allTokenTableBody");
  tbody.innerHTML =
    '<tr><td colspan="6" class="text-center py-8"><span class="loading loading-spinner"></span></td></tr>';
  try {
    const tokens = await fetch("http://localhost:8001/mealToken/get/all", {
      headers: getHeaders(),
    }).then(parseData);
    tbody.innerHTML = tokens
      .map((t) => {
        const amount = extractMoney(t).toFixed(2);
        const method = t.transaction?.paymentMethod?.paymentMethod || "-";
        const date = t.createdAt
          ? new Date(t.createdAt).toLocaleDateString()
          : "-";
        return `<tr>
                <td class="font-bold">#${t.mealTokenInformationId || "-"}</td>
                <td class="font-semibold text-primary">@${t.user?.userName || "-"}</td>
                <td>Room ${t.room?.roomNo || "-"}</td>
                <td class="text-secondary font-bold text-lg">+${t.tokenAmount}</td>
                <td class="text-green-600 font-bold">৳ ${amount}</td>
                <td class="text-xs uppercase font-bold">${method} | ${date}</td>
            </tr>`;
      })
      .join("");
  } catch (e) {}
}
