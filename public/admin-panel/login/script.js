document.querySelector("button#login").onclick = () => {
  let pass = document.querySelector("input").value;
  sessionStorage.setItem("admin-password", pass);
  document.location = "/admin-panel/dash?password=" + pass;
};
