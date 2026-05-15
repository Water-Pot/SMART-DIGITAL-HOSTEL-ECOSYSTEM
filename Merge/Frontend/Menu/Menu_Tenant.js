async function openViewMenusModal() {
    meal_list_modal.showModal();
    const tbody = document.getElementById('menuTableBody');
    try {
        const res = await fetch("http://localhost:8001/menu/get/all", { method: "GET", headers: getHeaders() });
        const menus = await res.json();
        tbody.innerHTML = menus.map(m =>
            `<tr>
                <td class="font-bold">${m.menuName}</td>
                <td class="capitalize">${m.day}</td>
                <td class="text-orange-600 font-bold">${m.mealType?.mealType || '-'}</td>
                <td>${m.menuItems.map(it => `<span class="badge badge-sm m-1">${it.itemName}</span>`).join('')}</td>
            </tr>`
        ).join('');
    } catch (error) { }
}