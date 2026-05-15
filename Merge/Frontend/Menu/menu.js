let currentLoadedMenus = [];

// View all menus
async function openViewMenusModal() {
    meal_list_modal.showModal();
    const tbody = document.getElementById('menuTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8"><span class="loading loading-spinner"></span></td></tr>';
    try {
        const menus = await fetch("http://localhost:8001/menu/get/all", { headers: getHeaders() }).then(parseData);
        currentLoadedMenus = menus;
        tbody.innerHTML = menus.map(m =>
            `<tr>
                <td class="font-bold">${m.menuName}</td>
                <td class="capitalize font-medium text-sm">${m.day}</td>
                <td class="uppercase font-bold text-xs tracking-wider text-primary">${m.mealType?.mealType || '-'}</td>
                <td class="flex flex-wrap gap-1">
                    ${(m.menuItems || []).map(i => `<span class="badge badge-outline badge-sm">${i.itemName}</span>`).join('')}
                </td>
                <td>
                    <button class="btn btn-xs btn-outline btn-primary font-bold"
                        onclick="openUpdateMenuModal(${m.menuId})">Edit</button>
                </td>
            </tr>`
        ).join('');
    } catch (e) { }
}

// Open update menu modal (prefill values)
async function openUpdateMenuModal(menuId) {
    const menu = currentLoadedMenus.find(m => m.menuId === menuId);
    if (!menu) return;
    document.getElementById('u_menuId').value = menu.menuId;
    document.getElementById('u_day').value = menu.day.toLowerCase();
    document.getElementById('u_mealType').value = menu.mealType?.mealType || '';

    const existingItems = (menu.menuItems || []).map(item => item.itemName);
    try {
        const items = await fetch("http://localhost:8001/menuItem/get/all", { headers: getHeaders() }).then(parseData);
        document.getElementById('u_menuItemsContainer').innerHTML = items.map(i => {
            const isChecked = existingItems.includes(i.itemName) ? 'checked' : '';
            return `<label class="cursor-pointer label flex gap-2 bg-base-100 px-3 py-2 rounded-lg border border-base-300 hover:border-primary">
                <input type="checkbox" name="updateMenuCb" value="${i.itemName}"
                    class="checkbox checkbox-sm checkbox-primary" ${isChecked} />
                <span class="font-medium text-sm">${i.itemName}</span>
            </label>`;
        }).join('');
    } catch (e) { }
    update_menu_modal.showModal();
}

// Load menu items into create menu checkbox list
document.querySelector('[onclick="create_menu_modal.showModal()"]').addEventListener('click', async () => {
    const items = await fetch("http://localhost:8001/menuItem/get/all", { headers: getHeaders() }).then(parseData);
    document.getElementById('m_menuItemsContainer').innerHTML = items.map(i =>
        `<label class="cursor-pointer label flex gap-2 bg-base-100 px-3 py-2 rounded-lg border border-base-300 hover:border-primary">
            <input type="checkbox" name="createMenuCb" value="${i.itemName}"
                class="checkbox checkbox-sm checkbox-primary" />
            <span class="font-medium text-sm">${i.itemName}</span>
        </label>`
    ).join('');
});

// Create menu
document.getElementById('formCreateMenu').addEventListener('submit', async (e) => {
    e.preventDefault();
    const checked = Array.from(document.querySelectorAll('input[name="createMenuCb"]:checked')).map(cb => cb.value);
    if (checked.length === 0) return showToast("Select an item!", "error");
    try {
        const res = await fetch("http://localhost:8001/menu/create", {
            method: "POST", headers: getHeaders(),
            body: JSON.stringify({
                day: document.getElementById('m_day').value,
                mealType: document.getElementById('m_mealType').value,
                menuItems: checked
            })
        });
        if (!res.ok) throw new Error(await res.text() || "Failed to create menu");
        showToast("Menu Created!");
        document.getElementById('formCreateMenu').reset();
        create_menu_modal.close();
        openViewMenusModal();
    } catch (e) { showToast(e.message, "error"); }
});

// Update menu
document.getElementById('formUpdateMenu').addEventListener('submit', async (e) => {
    e.preventDefault();
    const menuId = document.getElementById('u_menuId').value;
    const checked = Array.from(document.querySelectorAll('input[name="updateMenuCb"]:checked')).map(cb => cb.value);
    if (checked.length === 0) return showToast("Select an item!", "error");
    try {
        const res = await fetch(`http://localhost:8001/menu/update/menuId/${menuId}`, {
            method: "PUT", headers: getHeaders(),
            body: JSON.stringify({
                day: document.getElementById('u_day').value,
                mealType: document.getElementById('u_mealType').value,
                menuItems: checked
            })
        });
        if (!res.ok) throw new Error(await res.text() || "Failed to update menu");
        showToast("Menu Updated!");
        update_menu_modal.close();
        openViewMenusModal();
    } catch (e) { showToast(e.message, "error"); }
});