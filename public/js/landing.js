const fadeUp = document.querySelectorAll(".image");
if (fadeUp) {
  window.addEventListener("scroll", function(event) {
    fadeUp.forEach(function(element) {
      if (window.scrollY >= (element.offsetTop - window.innerHeight)) {
        element.classList.add("fade-in");
      } else {
        element.classList.remove("fade-in");
      }
    });
  });
}


const fadeText = document.querySelectorAll(".description");
if (fadeText) {
  window.addEventListener("scroll", function(event) {
    fadeText.forEach(function(element) {
      if (window.scrollY >= (element.offsetTop - window.innerHeight)) {
        element.classList.add("fade-in");
      } else {
        element.classList.remove("fade-in");
      }
    });
  });
}