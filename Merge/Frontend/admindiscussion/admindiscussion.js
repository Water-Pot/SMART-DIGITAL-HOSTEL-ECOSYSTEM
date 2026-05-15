// View all discussions + replies
async function openDiscussionsModal() {
  discussion_list_modal.showModal();
  const container = document.getElementById("discussionsContainer");
  container.innerHTML =
    '<div class="text-center py-4"><span class="loading loading-spinner text-primary"></span> Loading...</div>';
  try {
    const discussions = await fetch(
      "http://localhost:8001/discussion/get/all",
      { headers: getHeaders() },
    ).then(parseData);
    container.innerHTML = discussions
      .reverse()
      .map((d) => {
        const author = d.user?.userName || "Unknown";
        const dDate = new Date(d.createdAt || Date.now());
        const dateStr = dDate.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        const timeStr = dDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        let replies = (d.comments || [])
          .map(
            (c) =>
              `<div class="bg-base-100 p-2 rounded-lg mt-2 text-sm border-l-4 border-primary shadow-sm">
                    <div class="flex justify-between items-center opacity-70 text-xs mb-1">
                        <span class="font-bold text-primary">@${c.user?.userName || "User"}</span>
                    </div>
                    <p class="font-medium">${c.comment}</p>
                </div>`,
          )
          .join("");
        return `<div class="card bg-base-100 shadow-md border border-base-300">
                <div class="card-body p-4">
                    <div class="flex justify-between items-start mb-2 border-b pb-2">
                        <span class="font-bold text-lg text-primary">@${author}</span>
                        <div class="text-right">
                            <span class="block text-xs font-bold text-gray-500">📅 ${dateStr}</span>
                            <span class="block text-xs font-bold text-gray-400">🕒 ${timeStr}</span>
                        </div>
                    </div>
                    <p class="text-base font-semibold py-2">${d.description}</p>
                    <div class="mt-2 bg-base-200 p-3 rounded-xl">
                        <h4 class="font-bold text-sm mb-2 text-primary">Replies</h4>
                        <div class="max-h-32 overflow-y-auto pr-1">
                            ${replies || '<div class="text-xs font-bold text-gray-400 mt-2 text-center">No replies yet.</div>'}
                        </div>
                        <div class="flex gap-2 mt-3 pt-2 border-t border-base-300">
                            <input id="ci_${d.discussionId}" class="input input-sm input-bordered flex-1" placeholder="Write a reply..."/>
                            <button class="btn btn-sm btn-primary text-white" onclick="submitComment(${d.discussionId})">Reply</button>
                        </div>
                    </div>
                </div>
            </div>`;
      })
      .join("");
  } catch (e) {}
}

// Post new discussion (Admin)
document
  .getElementById("formAddDiscussion")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:8001/discussion/create", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          description: document.getElementById("d_description").value,
          roomNo: 0,
          userId: currentUserId,
        }),
      });
      showToast("Posted!");
      document.getElementById("formAddDiscussion").reset();
      add_discussion_modal.close();
      openDiscussionsModal();
    } catch (e) {}
  });

// Submit reply/comment
async function submitComment(id) {
  const val = document.getElementById("ci_" + id).value;
  if (!val.trim()) return;
  try {
    await fetch("http://localhost:8001/comment/create", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        comment: val,
        userId: currentUserId,
        discussionId: id,
        roomNo: 0,
      }),
    });
    showToast("Replied!");
    openDiscussionsModal();
  } catch (e) {}
}
