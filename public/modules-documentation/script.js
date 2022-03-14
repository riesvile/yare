let elements = document.querySelectorAll("pre[src]")

elements.forEach(async (element) => {
  src = element.getAttribute("src");
  let req = await fetch(src);
  let text = await req.text();
  let codeElement = document.createElement("code");
  codeElement.innerHTML = text;
  codeElement.classList = element.classList
  Prism.highlightElement(codeElement)
  element.innerHTML = codeElement.outerHTML.trim();
})