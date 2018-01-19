(function (window, document) {

  var contentIsLoadedListener = function () {
    var navbar = document.getElementById("navbar");
    if (navbar) {
      var navbarOffset = navbar.offsetTop;

      var toggleNavbarFixing = function () {
        if (window.pageYOffset >= navbarOffset) {
          navbar.classList.add("sticky")
        } else {
          navbar.classList.remove("sticky");
        }
      }
      window.addEventListener('scroll', toggleNavbarFixing);
    }
  }
  document.addEventListener('DOMContentLoaded', contentIsLoadedListener);


})(window, document);