// View all menu items
async function openViewMenuItemsModal() {
    menuItem_list_modal.showModal();
    const tbody = document.getElementById('menuItemTableBody');
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8"><span class="loading loading-spinner"></span></td></tr>';
    try {
        const items = await fetch("http://localhost:8001/menuItem/get/all", { headers: getHeaders() }).then(parseData);
        tbody.innerHTML = items.map(it =>
            `<tr>
                <td class="text-sm">${it.menuItemId}</td>
                <td class="font-bold text-primary">${it.itemName}</td>
                <td class="text-sm">${it.description || '-'}</td>
                <td>
                    <button class="btn btn-xs btn-outline btn-primary font-bold"
                        onclick="openEditMenuItemModal(${it.menuItemId}, '${it.itemName.replace(/'/g, "\\'")}', '${(it.description || '').replace(/'/g, "\\'")}')">
                        Edit
                    </button>
                </td>
            </tr>`
        ).join('');
    } catch (e) { }
}

// Open edit modal
function openEditMenuItemModal(id, name, desc) {
    document.getElementById('e_menuItemId').value = id;
    document.getElementById('e_itemName').value = name;
    document.getElementById('e_itemDesc').value = desc;
    edit_menuItem_modal.showModal();
}

// Add menu item
handleAdd('formAddMenuItem', 'http://localhost:8001/menuItem/create',
    () => ({
        itemName: document.getElementById('itemName').value,
        description: document.getElementById('itemDesc').value
    }),
    'add_menuItem_modal'
);

// Update menu item
document.getElementById('formEditMenuItem').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await fetch(
            `http://localhost:8001/menuItem/update/menuItemId/${document.getElementById('e_menuItemId').value}`,
            {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify({
                    itemName: document.getElementById('e_itemName').value,
                    description: document.getElementById('e_itemDesc').value
                })
            }
        );
        showToast("Updated!");
        edit_menuItem_modal.close();
        openViewMenuItemsModal();
    } catch (e) { }
});