// View all discussions + replies
async function openDiscussionsModal() {
  discussion_list_modal.showModal();
  const container = document.getElementById("discussionsContainer");
  container.innerHTML =
    '<div class="text-center py-4"><span class="loading loading-spinner text-cyan-600"></span> Loading...</div>';
  try {
    const res = await fetch("http://localhost:8001/discussion/get/all", {
      method: "GET",
      headers: getHeaders(),
    });
    let rawData = await res.json();
    let discussions = Array.isArray(rawData)
      ? rawData.flat()
      : rawData.data
        ? [rawData.data].flat()
        : [rawData];

    let html = "";
    discussions.reverse().forEach((d) => {
      if (!d.discussionId) return;
      const author = d.user?.userName || "Unknown";
      const dDate = d.createdAt ? new Date(d.createdAt) : new Date();
      const dateStr = dDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const timeStr = dDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      let commentsHtml =
        (d.comments || [])
          .map((c) => {
            const cAuthor = c.user?.userName || "Unknown";
            return `<div class="bg-base-100 p-2 rounded-lg mt-2 text-sm border-l-4 border-cyan-500 shadow-sm">
                    <span class="font-bold text-primary">@${cAuthor}</span>
                    <p class="font-medium">${c.comment || ""}</p>
                </div>`;
          })
          .join("") ||
        '<div class="text-xs font-bold text-gray-400 mt-2 text-center">No replies yet.</div>';

      html += `<div class="card bg-base-100 shadow-md border border-base-300">
                <div class="card-body p-4">
                    <div class="flex justify-between items-start mb-2 border-b pb-2">
                        <span class="font-bold text-lg text-primary">@${author}</span>
                        <div class="text-right">
                            <span class="block text-xs font-bold text-gray-500">📅 ${dateStr}</span>
                            <span class="block text-xs font-bold text-gray-400">🕒 ${timeStr}</span>
                        </div>
                    </div>
                    <p class="text-base font-semibold py-2">${d.description || ""}</p>
                    <div class="mt-2 bg-base-200 p-3 rounded-xl">
                        <h4 class="font-bold text-sm mb-2 text-cyan-600">Replies</h4>
                        <div class="max-h-32 overflow-y-auto pr-1">${commentsHtml}</div>
                        <div class="flex gap-2 mt-3 pt-2 border-t border-base-300">
                            <input type="text" id="comment_input_${d.discussionId}"
                                class="input input-sm input-bordered flex-1" placeholder="Write a reply..." />
                            <button class="btn btn-sm bg-cyan-600 text-white"
                                onclick="submitComment(${d.discussionId})">Reply</button>
                        </div>
                    </div>
                </div>
            </div>`;
    });
    container.innerHTML =
      html ||
      '<div class="text-center text-gray-500 py-4 font-bold">No discussions found.</div>';
  } catch (e) {
    container.innerHTML =
      '<div class="text-center text-error font-bold py-4">Error loading forum</div>';
  }
}

// Post new discussion (Tenant)
document
  .getElementById("formAddDiscussion")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUserId) {
      await loadUserProfile();
      if (!currentUserId) return showToast("Profile loading...", "error");
    }
    const payload = {
      description: document.getElementById("d_description").value,
      roomNo: activeAllocatedRoom || 0,
      userId: currentUserId,
    };
    try {
      const res = await fetch("http://localhost:8001/discussion/create", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok || res.status === 302) {
        showToast("Discussion posted!", "success");
        document.getElementById("formAddDiscussion").reset();
        add_discussion_modal.close();
        openDiscussionsModal();
      }
    } catch (err) {
      showToast(err.message, "error");
    }
  });

// Submit reply/comment (Tenant)
async function submitComment(discussionId) {
  const input = document.getElementById(`comment_input_${discussionId}`);
  if (!input.value.trim() || !currentUserId) return;
  const payload = {
    comment: input.value.trim(),
    userId: currentUserId,
    roomNo: activeAllocatedRoom || 0,
    discussionId,
  };
  try {
    const res = await fetch("http://localhost:8001/comment/create", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok || res.status === 302) {
      showToast("Reply added!", "success");
      openDiscussionsModal();
    }
  } catch (err) {
    showToast(err.message, "error");
  }
}
