// Admin — JavaScript
let targetRoleChangeUserId = null;

// Open change role modal (prefill current role)
function openChangeRoleModal(id, role) {
    targetRoleChangeUserId = id;
    document.getElementById('cr_roleSelect').value = role.toLowerCase();
    change_role_modal.showModal();
}

// Submit role change
async function submitRoleChange() {
    try {
        await fetch(
            `http://localhost:8001/user/change-role/${targetRoleChangeUserId}?role=${document.getElementById('cr_roleSelect').value}`,
            { method: "PUT", headers: getHeaders() }
        );
        showToast("Role Updated!");
        change_role_modal.close();
        openViewUsersModal(); // Refresh user list
    } catch (e) { }
}
// signup.html এ
const payload = {
    // ...
    role: "tenant", // hardcoded
};
// login.html এ
const userRole = userProfile.role ? userProfile.role.role.toLowerCase() : "tenant";
localStorage.setItem("userRole", userRole);

if (userRole === "admin") {
    window.location.href = "/admin-home.html";
} else {
    window.location.href = "/tenant-home.html";
}