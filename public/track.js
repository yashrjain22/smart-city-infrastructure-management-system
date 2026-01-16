document.addEventListener("DOMContentLoaded", () => {
  const trackBtn = document.getElementById("trackBtn");
  const trackIdInput = document.getElementById("trackId");
  const resultBox = document.getElementById("trackResult");

  trackBtn.addEventListener("click", () => {
    const enteredId = trackIdInput.value.trim().toUpperCase();

    if (!enteredId) {
      alert("⚠️ Please enter your Complaint ID.");
      return;
    }

    resultBox.innerHTML = `
      <p style="color:#14532d; font-weight:500;">
        🔍 Fetching complaint details...
      </p>
    `;

    fetch("/api/complaints")
      .then(res => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then(complaints => {
        const complaint = complaints.find(c => c.id === enteredId);

        if (!complaint) {
          resultBox.innerHTML = `
            <p style="color:red; font-weight:500;">
              ❌ No complaint found with this ID.
            </p>
          `;
          return;
        }

        // ✅ SHOW ALL FIELDS
        resultBox.innerHTML = `
          <div class="complaint-card">
            <h3>${complaint.category}</h3>

            <p><strong>Complaint ID:</strong> ${complaint.id}</p>
            <p><strong>Citizen Name:</strong> ${complaint.name}</p>
            <p><strong>Email:</strong> ${complaint.email}</p>

            <p><strong>Description:</strong> ${complaint.description}</p>
            <p><strong>Location:</strong> ${complaint.location}</p>
            <p><strong>Date & Time:</strong> ${complaint.time}</p>

            <p>
              <strong>Status:</strong>
              <span class="status ${complaint.status.replace(" ", "")}">
                ${complaint.status}
              </span>
            </p>

            ${complaint.image
            ? `<img src="${complaint.image}" alt="Complaint Image">`
            : ""
          }
          </div>
        `;
      })
      .catch(err => {
        console.error("TRACK ERROR:", err);
        resultBox.innerHTML = `
          <p style="color:red; font-weight:500;">
            ❌ Unable to fetch complaint data.
          </p>
        `;
      });
  });
});
