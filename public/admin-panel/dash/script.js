const urlSearchParams = new URLSearchParams(window.location.search);
const siteroot =
  location.protocol +
  "//" +
  window.location.hostname +
  (location.port ? ":" + location.port : "");

const originalhref = window.location.href;

document.querySelector("button#weight").onclick = async () => {
  let server = document.querySelector("#wServer").value;
  let weight = document.querySelector("#wWeight").value;
  weight = Number(weight);
  fetch(
    `${siteroot}/server-weight/${server}/${weight}?password=${urlSearchParams.get(
      "password"
    )}`
  )
    .then(() => {
      swal("Success!");
    })
    .catch((e) => {
      swal("Error...", e);
    });
};

document.querySelector("button#reload").onclick = () => {
  window.location = originalhref;
};

window.history.replaceState(null, "", siteroot + "/admin-panel/");
