const token = localStorage.getItem("token");
const isAdmin = localStorage.getItem("isAdmin");

// DEBUG: helpful when admin redirect loops occur
// console.log("adminAuth", { tokenPresent: !!token, isAdminStored: isAdmin });

if (!token || isAdmin !== "true") {
    // remember where user wanted to go
    try {
        localStorage.setItem("postLoginRedirect", window.location.href.replace(window.location.origin, ""));
    } catch (e) {
        // ignore
    }

    window.location.replace("../login.html");
}

