// Load meal types into dropdowns (Menu create & update)
async function loadMealTypesForDropdown() {
    try {
        const types = await fetch("http://localhost:8001/mealType/get/all", { headers: getHeaders() }).then(parseData);
        const optionsHtml = types.map(t =>
            `<option value="${t.mealType}">${t.mealType.toUpperCase()}</option>`
        ).join('');
        document.getElementById('m_mealType').innerHTML =
            '<option value="" disabled selected>Select Meal Type</option>' + optionsHtml;
        document.getElementById('u_mealType').innerHTML =
            '<option value="" disabled selected>Select Meal Type</option>' + optionsHtml;
    } catch (e) { console.error("Failed to load meal types:", e); }
}

// View all meal types
async function openViewMealTypesModal() {
    mealType_list_modal.showModal();
    const tbody = document.getElementById('mealTypeTableBody');
    tbody.innerHTML = '<tr><td colspan="3" class="text-center py-8"><span class="loading loading-spinner"></span></td></tr>';
    try {
        const types = await fetch("http://localhost:8001/mealType/get/all", { headers: getHeaders() }).then(parseData);
        tbody.innerHTML = types.map(it =>
            `<tr>
                <td class="text-sm">${it.mealTypeId}</td>
                <td class="font-bold text-primary uppercase">${it.mealType}</td>
                <td>
                    <button class="btn btn-xs btn-outline btn-primary font-bold"
                        onclick="openEditMealTypeModal('${it.mealType.replace(/'/g, "\\'")}')">Edit</button>
                </td>
            </tr>`
        ).join('');
    } catch (e) { }
}

// Open edit modal with prefilled value
function openEditMealTypeModal(old) {
    document.getElementById('e_oldMealType').value = old;
    document.getElementById('e_mealTypeName').value = old;
    edit_mealType_modal.showModal();
}

// Add meal type
handleAdd('formAddMealType', 'http://localhost:8001/mealType/create',
    () => ({ mealType: document.getElementById('mealTypeName').value }),
    'add_mealType_modal'
);

// Update meal type
document.getElementById('formEditMealType').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await fetch(
            `http://localhost:8001/mealType/update/mealType/${document.getElementById('e_oldMealType').value}`,
            {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify({ mealType: document.getElementById('e_mealTypeName').value })
            }
        );
        showToast("Updated!");
        edit_mealType_modal.close();
        openViewMealTypesModal();
    } catch (e) { }
});