if (sessionStorage.loggedIn === 'true') {
  if (window.location.pathname.includes('login')) { 
    window.location.href = "../dashboard"; 
  }
} else if (window.location.pathname.includes("dashboard")) { 
  window.location.href = "../login"; 
}