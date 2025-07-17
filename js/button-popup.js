// Function to hide all dropdowns
function hideAllDropdowns() {
  document.querySelectorAll(".dropdown").forEach((dropdown) => {
    dropdown.style.display = "none";
  });
}

// Function to hide all popups
function hideAllPopups() {
  document.querySelectorAll(".info-popup").forEach((popup) => {
    popup.style.display = "none";
  });
}

// Function to show a specific dropdown and close all popups
function showDropdown(dropdownId) {
  hideAllDropdowns(); // Close all dropdowns first
  hideAllPopups(); // Close all popups to ensure none are open
  const dropdown = document.getElementById(dropdownId);
  dropdown.style.display = "block"; // Show the specific dropdown
}

// Function to show a specific popup and close all others
function showPopup(popupId) {
  hideAllPopups(); // Close all popups first
  const popup = document.getElementById(popupId);
  popup.style.display = "block"; // Show the specific popup
}

document
  .querySelectorAll("#partnerBtnDesktop, #partnerBtnMobile")
  .forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation(); // Stop event propagation to document
      showDropdown("dropdownPartner"); // Open the specific dropdown for Sign Up
    });
  });

// Add event listeners for the info buttons to open popups
document.querySelectorAll(".info-btn").forEach((button) => {
  button.addEventListener("click", function (event) {
    event.stopPropagation(); // Stop event propagation
    const popupId = this.getAttribute("data-popup"); // Get the popup id
    showPopup(popupId); // Show the related popup
  });
});

// Add event listeners for close buttons on popups
document.querySelectorAll(".close-btn").forEach((button) => {
  button.addEventListener("click", function (event) {
    event.stopPropagation(); // Stop event propagation
    const popupId = this.getAttribute("data-close"); // Get the popup id to close
    document.getElementById(popupId).style.display = "none"; // Close the popup
  });
});

// Event listener to close dropdowns when clicking outside, but not popups
document.addEventListener("click", function () {
  hideAllDropdowns(); // Close all dropdowns when clicking outside
});

// Prevent closing popups when clicking inside them
document.querySelectorAll(".info-popup").forEach((popup) => {
  popup.addEventListener("click", function (event) {
    event.stopPropagation(); // Prevent closing the popup when clicking inside
  });
});
