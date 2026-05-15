// View Room Types
async function openViewRoomTypesModal() {
    roomType_list_modal.showModal();
    const tbody = document.getElementById('roomTypeTableBody');
    tbody.innerHTML = '<tr><td colspan="3" class="text-center py-8"><span class="loading loading-spinner"></span></td></tr>';
    try {
        const types = await fetch("http://localhost:8001/roomType/get/all", { headers: getHeaders() }).then(parseData);
        tbody.innerHTML = types.map(t =>
            `<tr>
                <td>${t.roomTypeId}</td>
                <td class="font-bold text-primary">${t.roomType}</td>
                <td>${new Date(t.createdAt).toLocaleDateString()}</td>
            </tr>`
        ).join('');
    } catch (e) { }
}

// Add Room Type
handleAdd('formAddRoomType', 'http://localhost:8001/roomType/create',
    () => ({ roomType: document.getElementById('roomTypeName').value }),
    'add_roomType_modal'
);

// Load Room Types for Room dropdown
async function loadRoomTypesForDropdown() {
    try {
        const types = await fetch("http://localhost:8001/roomType/get/all", { headers: getHeaders() }).then(parseData);
        document.getElementById('r_roomType').innerHTML = types.map(t =>
            `<option value="${t.roomType}">${t.roomType}</option>`
        ).join('');
    } catch (e) { }
}