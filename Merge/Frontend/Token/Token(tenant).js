// Token balance (profile card badge)
async function loadTokenBalance() {
    try {
        const username = getLoggedInUsername();
        const res = await fetch(`http://localhost:8001/mealToken/get/userName/${username}`, { method: "GET", headers: getHeaders() });
        if (res.ok || res.status === 302) {
            const tokensRaw = await res.json();
            const tokens = Array.isArray(tokensRaw) ? tokensRaw.flat() : (tokensRaw.data || []);
            let totalTokens = 0;
            tokens.forEach(t => { totalTokens += (t.tokenAmount || 0); });
            document.getElementById('p_mealTokens').textContent = totalTokens;
        }
    } catch (error) { console.error("Error loading token balance", error); }
}

// Buy token — redirect to payment page
document.getElementById('formBuyToken').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!activeAllocatedRoom) {
        showToast("You need an active room booking to buy meal tokens!", "error");
        return;
    }
    const payload = {
        userName: getLoggedInUsername(),
        roomNo: parseInt(activeAllocatedRoom),
        tokenAmount: parseInt(document.getElementById('t_tokenAmount').value),
        amount: parseFloat(document.getElementById('t_amount').value),
        paymentMethod: document.getElementById('t_paymentMethod').value
    };
    localStorage.setItem("pendingBookingInfo", JSON.stringify(payload));
    localStorage.setItem("paymentApiUrl", "http://localhost:8001/mealToken/create");
    localStorage.setItem("returnTo", "/tenant-home.html");
    window.location.href = "/payment.html";
});

// Token purchase history
async function openTokenHistoryModal() {
    token_history_modal.showModal();
    const tbody = document.getElementById('tokenHistoryTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center"><span class="loading loading-spinner"></span> Loading history...</td></tr>';
    try {
        const username = getLoggedInUsername();
        const res = await fetch(`http://localhost:8001/mealToken/get/userName/${username}`, { method: "GET", headers: getHeaders() });
        if (!res.ok && res.status !== 302) throw new Error("");
        let raw = await res.json();
        const tokens = Array.isArray(raw) ? raw.flat() : (raw.data || []);

        if (tokens.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-500">No token history found.</td></tr>';
            return;
        }

        let html = "";
        tokens.reverse().forEach(t => {
            const date = t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A';
            const amount = t.transaction?.amount
                ? parseFloat(t.transaction.amount).toFixed(2)
                : (t.amount ? parseFloat(t.amount).toFixed(2) : '0.00');
            const method = t.transaction?.paymentMethod?.paymentMethod || '-';
            html += `<tr>
                <td class="font-bold">#${t.mealTokenInformationId || '-'}</td>
                <td class="text-sm">${date}</td>
                <td class="font-bold">Room ${t.room?.roomNo || '-'}</td>
                <td class="font-bold text-secondary text-lg">+${t.tokenAmount}</td>
                <td class="text-green-600 font-bold">৳ ${amount}</td>
                <td class="uppercase text-xs font-bold">${method}</td>
            </tr>`;
        });
        tbody.innerHTML = html;
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-error">Error loading history</td></tr>';
    }
}