const urlSearchParams = new URLSearchParams(window.location.search);

document.querySelector("button#weight").onclick = async () => {
  let server = document.querySelector("#wServer").value;
  let weight = document.querySelector("#wWeight").value;
  weight = Number(weight);
  let root =
    location.protocol +
    "//" +
    window.location.hostname +
    (location.port ? ":" + location.port : "");
  fetch(
    `${root}/server-weight/${server}/${weight}?password=${urlSearchParams.get(
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
