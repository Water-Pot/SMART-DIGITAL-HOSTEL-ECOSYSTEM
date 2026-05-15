// View Rooms
async function openViewRoomsModal() {
    room_list_modal.showModal();
    const tbody = document.getElementById('roomTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8"><span class="loading loading-spinner"></span></td></tr>';
    try {
        const rooms = await fetch("http://localhost:8001/room/get/all", { headers: getHeaders() }).then(parseData);
        tbody.innerHTML = rooms.map(r =>
            `<tr>
                <td class="font-bold">Room ${r.roomNo}</td>
                <td>${r.roomType || '-'}</td>
                <td>Floor ${r.floorNo}</td>
                <td>৳${r.perDayRentFee}/day</td>
                <td>${r.availableSeat}/${r.totalSeat}</td>
                <td>
                    <span class="badge ${r.occupied ? 'badge-error' : 'badge-success'} text-white badge-sm font-bold">
                        ${r.occupied ? 'Occupied' : 'Available'}
                    </span>
                </td>
            </tr>`
        ).join('');
    } catch (e) { }
}

// Add Room
handleAdd('formAddRoom', 'http://localhost:8001/room/create',
    () => ({
        roomNo: document.getElementById('r_roomNo').value,
        roomType: document.getElementById('r_roomType').value,
        floorNo: document.getElementById('r_floorNo').value,
        perDayRentFee: document.getElementById('r_rentFee').value,
        totalSeat: document.getElementById('r_totalSeat').value
    }),
    'add_room_modal'
);