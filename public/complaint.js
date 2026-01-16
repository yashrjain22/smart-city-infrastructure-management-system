document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("complaintForm");
    const submitBtn = document.getElementById("submitBtn");

    const locationInput = document.getElementById("location");
    const manualBtn = document.getElementById("manualLocBtn");
    const manualBox = document.getElementById("manualLocationBox");
    const manualInput = document.getElementById("manualLocation");

    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    const copyBtn = document.getElementById("copyIdBtn");

    let currentComplaintId = "";

    form.addEventListener("submit", e => e.preventDefault());

    /* ------------------ LOCATION ------------------ */
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
                )
                    .then(res => res.json())
                    .then(data => {
                        locationInput.value = data.display_name || "Location detected";
                    })
                    .catch(() => {
                        locationInput.value = "Unable to fetch location";
                    });
            },
            () => {
                locationInput.value = "Location permission denied";
            }
        );
    }

    manualBtn.addEventListener("click", () => {
        manualBox.style.display = "block";
        manualInput.focus();
    });

    /* ------------------ SUBMIT ------------------ */
    submitBtn.addEventListener("click", () => {
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const category = document.getElementById("category").value;
        const description = document.getElementById("description").value.trim();
        const imageFile = document.getElementById("image").files[0];

        const finalLocation =
            manualInput.value.trim() || locationInput.value.trim();

        if (!name || !email || !category || !description) {
            alert("⚠️ Please fill all required fields.");
            return;
        }

        currentComplaintId =
            "CMP-" + Date.now().toString(36).toUpperCase();

        const saveComplaint = imageData => {
            const complaint = {
                id: currentComplaintId,
                name,
                email,
                category,
                description,
                location: finalLocation,
                image: imageData || "",
                status: "Pending",
                time: new Date().toLocaleString()
            };

            fetch("/api/complaints", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(complaint)
            })
                .then(res => {
                    if (!res.ok) throw new Error();
                    return res.json();
                })
                .then(() => {
                    showToast(currentComplaintId);

                    form.reset();
                    manualBox.style.display = "none";
                    locationInput.value = "Auto-detected location";

                    // Auto redirect after 5 seconds
                    setTimeout(() => {
                        window.location.href = "track.html";
                    }, 5000);
                })
                .catch(() => {
                    alert("❌ Failed to submit complaint.");
                });
        };

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = e => saveComplaint(e.target.result);
            reader.readAsDataURL(imageFile);
        } else {
            saveComplaint("");
        }
    });

    /* ------------------ TOAST ------------------ */
    function showToast(id) {
        toastMessage.innerHTML =
            `✅ Complaint Submitted Successfully<br><strong>ID:</strong> ${id}`;
        toast.style.display = "flex";

        if (navigator.clipboard) {
            navigator.clipboard.writeText(id).catch(() => { });
        }
    }

    copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(currentComplaintId).then(() => {
            copyBtn.innerText = "✅ Copied";
            setTimeout(() => (copyBtn.innerText = "📋 Copy ID"), 2000);
        });
    });
});
