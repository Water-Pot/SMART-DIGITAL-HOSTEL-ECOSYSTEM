// View Floors
async function openViewFloorsModal() {
    floor_list_modal.showModal();
    const tbody = document.getElementById('floorTableBody');
    tbody.innerHTML = '<tr><td colspan="3" class="text-center py-8"><span class="loading loading-spinner"></span></td></tr>';
    try {
        const floors = await fetch("http://localhost:8001/floor/get", { headers: getHeaders() }).then(parseData);
        tbody.innerHTML = floors.map(f =>
            `<tr>
                <td>${f.floorId}</td>
                <td class="font-bold">Floor ${f.floorNo}</td>
                <td>${new Date(f.createdAt).toLocaleDateString()}</td>
            </tr>`
        ).join('');
    } catch (e) { }
}

// Add Floor
handleAdd('formAddFloor', 'http://localhost:8001/floor/create',
    () => ({ floorNo: document.getElementById('floorNo').value }),
    'add_floor_modal'
);

// Load Floors for Room dropdown
async function loadFloorsForDropdown() {
    try {
        const floors = await fetch("http://localhost:8001/floor/get", { headers: getHeaders() }).then(parseData);
        document.getElementById('r_floorNo').innerHTML = floors.map(f =>
            `<option value="${f.floorNo}">Floor ${f.floorNo}</option>`
        ).join('');
    } catch (e) { }
}