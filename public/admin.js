document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("complaintList");
    const searchInput = document.getElementById("searchId");
    const statusFilter = document.getElementById("statusFilter");

    let allComplaints = [];

    loadComplaints();

    /* =========================
       LOAD COMPLAINTS
    ========================== */
    function loadComplaints() {
        fetch("/api/complaints")
            .then(res => res.json())
            .then(data => {
                allComplaints = data;
                renderFilteredComplaints();
            });
    }

    /* =========================
       FILTER + SEARCH
    ========================== */
    function renderFilteredComplaints() {
        const searchValue = searchInput.value.trim().toUpperCase();
        const selectedStatus = statusFilter.value;

        container.innerHTML = "";

        const filtered = allComplaints.filter(c => {
            const matchId =
                !searchValue || c.id.toUpperCase().includes(searchValue);

            const matchStatus =
                selectedStatus === "all" || c.status === selectedStatus;

            return matchId && matchStatus;
        });

        if (!filtered.length) {
            container.innerHTML = "<p>No matching complaints found.</p>";
            return;
        }

        filtered.forEach(renderComplaint);
    }

    /* =========================
       RENDER COMPLAINT
    ========================== */
    function renderComplaint(c) {
        const div = document.createElement("div");
        div.className = "complaint";

        div.innerHTML = `
      <h3>${c.category}</h3>
      <p><strong>ID:</strong> ${c.id}</p>
      <p><strong>Name:</strong> ${c.name}</p>
      <p><strong>Email:</strong> ${c.email}</p>
      <p><strong>Description:</strong> ${c.description}</p>
      <p><strong>Location:</strong> ${c.location}</p>
      <p><strong>Date:</strong> ${c.time}</p>

      <label><strong>Status:</strong></label>
      <select class="status-select">
        <option ${c.status === "Pending" ? "selected" : ""}>Pending</option>
        <option ${c.status === "In Progress" ? "selected" : ""}>In Progress</option>
        <option ${c.status === "Resolved" ? "selected" : ""}>Resolved</option>
      </select>

      ${c.image ? `<img src="${c.image}">` : ""}

      <div class="actions">
        <button class="save-btn">Update Status</button>
        <button class="delete-btn">Delete</button>
      </div>
    `;

        const statusSelect = div.querySelector(".status-select");
        const saveBtn = div.querySelector(".save-btn");
        const deleteBtn = div.querySelector(".delete-btn");

        /* UPDATE STATUS */
        saveBtn.addEventListener("click", () => {
            fetch(`/api/complaints/${c.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: statusSelect.value })
            })
                .then(res => res.json())
                .then(() => loadComplaints());
        });

        /* DELETE */
        deleteBtn.addEventListener("click", () => {
            if (!confirm("Delete this complaint?")) return;

            fetch(`/api/complaints/${c.id}`, {
                method: "DELETE"
            })
                .then(res => res.json())
                .then(() => loadComplaints());
        });

        container.appendChild(div);
    }

    /* =========================
       EVENTS
    ========================== */
    searchInput.addEventListener("input", renderFilteredComplaints);
    statusFilter.addEventListener("change", renderFilteredComplaints);
});
