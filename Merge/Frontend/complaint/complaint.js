// Admin — JavaScript
let availableComplaintStatuses = [];

// Load all available complaint statuses (once)
async function loadComplaintStatuses() {
    try {
        availableComplaintStatuses = await fetch(
            "http://localhost:8001/complaintStatus/get/all",
            { headers: getHeaders() }
        ).then(parseData);
    } catch (e) { }
}

// View all complaints with status update dropdown
async function openViewComplaintsModal() {
    complaint_list_modal.showModal();
    const tbody = document.getElementById('complaintTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8"><span class="loading loading-spinner"></span></td></tr>';

    // Load statuses if not already loaded
    if (availableComplaintStatuses.length === 0) await loadComplaintStatuses();

    try {
        const complaints = await fetch(
            "http://localhost:8001/complaint/get/all",
            { headers: getHeaders() }
        ).then(parseData);

        tbody.innerHTML = complaints.map(c => {
            const status = c.complaintStatus?.status || 'Pending';
            const isRes = status.toLowerCase() === 'resolved';

            // Status dropdown options
            const opts = availableComplaintStatuses.map(s =>
                `<option value="${s.status}" ${s.status === status ? 'selected' : ''}>${s.status}</option>`
            ).join('');

            // If resolved → show "Final", else show dropdown + save button
            const actionCell = isRes
                ? `<span class="font-bold text-gray-400 text-sm">Final</span>`
                : `<select id="cs_${c.complaintId}" class="select select-bordered select-sm mr-2">${opts}</select>
                   <button class="btn btn-sm btn-primary" onclick="updateComplaintStatus(${c.complaintId})">Save</button>`;

            return `<tr>
                <td class="font-bold">#${c.complaintId}</td>
                <td class="font-semibold text-primary">@${c.user?.userName || '-'}</td>
                <td>
                    <div class="font-bold">${c.title}</div>
                    <div class="text-xs text-gray-500 mt-1">${c.description}</div>
                </td>
                <td>
                    <span class="badge ${isRes ? 'badge-success text-white' : 'badge-warning font-bold'} badge-sm">
                        ${status}
                    </span>
                </td>
                <td class="flex items-center">${actionCell}</td>
            </tr>`;
        }).join('');
    } catch (e) { }
}

// Update complaint status
async function updateComplaintStatus(id) {
    try {
        await fetch(
            `http://localhost:8001/complaint/update/${id}?status=${document.getElementById('cs_' + id).value}`,
            { method: "PUT", headers: getHeaders() }
        );
        showToast("Updated!");
        openViewComplaintsModal();
    } catch (e) { }
}
// Tenant — JavaScript
// Submit new complaint
document.getElementById('formAddComplaint').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Must have an active room booking
    if (!activeAllocatedRoom) {
        showToast("You need an active room booking to submit a complaint!", "error");
        return;
    }

    const payload = {
        user: getLoggedInUsername(),
        room: parseInt(activeAllocatedRoom),
        title: document.getElementById('c_title').value,
        description: document.getElementById('c_description').value
    };

    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerHTML = '<span class="loading loading-spinner"></span>';
    btn.disabled = true;

    try {
        const res = await fetch("http://localhost:8001/complaint/create", {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        if (res.ok || res.status === 302) {
            showToast("Complaint submitted successfully!", "success");
            document.getElementById('formAddComplaint').reset();
            add_complaint_modal.close();
        } else throw new Error("Failed to submit complaint");
    } catch (err) {
        showToast(err.message, "error");
    } finally {
        btn.innerHTML = 'Submit ➔';
        btn.disabled = false;
    }
});

// View complaint history (by logged-in user)
async function openComplaintHistoryModal() {
    complaint_history_modal.showModal();
    const tbody = document.getElementById('complaintHistoryTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center"><span class="loading loading-spinner"></span> Loading history...</td></tr>';

    try {
        const username = getLoggedInUsername();
        const res = await fetch(
            `http://localhost:8001/complaint/get/userName/${username}`,
            { method: "GET", headers: getHeaders() }
        );
        if (!res.ok && res.status !== 302) throw new Error("");

        let raw = await res.json();
        const complaints = Array.isArray(raw) ? raw.flat() : (raw.data || []);

        if (complaints.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-500">No complaints found.</td></tr>';
            return;
        }

        tbody.innerHTML = complaints.map(c => {
            const date = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A';
            const currentStatus = c.complaintStatus?.status || 'Pending';

            // Badge color by status
            let badgeClass = 'badge-warning';
            if (currentStatus.toLowerCase() === 'resolved') badgeClass = 'badge-success text-white';
            else if (currentStatus.toLowerCase() === 'investigating') badgeClass = 'badge-info text-white';
            else if (currentStatus.toLowerCase() === 'in-progress') badgeClass = 'badge-primary text-white';

            return `<tr>
                <td class="font-bold">#${c.complaintId || c.id || '-'}</td>
                <td class="text-sm">${date}</td>
                <td class="font-bold text-primary">${c.title || 'N/A'}</td>
                <td class="text-sm opacity-80">${c.description || '-'}</td>
                <td><span class="badge ${badgeClass} badge-sm">${currentStatus}</span></td>
            </tr>`;
        }).join('');

    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-error">Error loading history</td></tr>';
    }
}
