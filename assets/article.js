class ArticleNavigation extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    let _this = this;
    setTimeout(() => {
      _this.progress_bar = document.getElementById('progress-bar');
      window.addEventListener('resize', function() {
        let h = document.querySelector('.header').offsetHeight - 1;
        if (window.innerWidth < 769) {
          document.documentElement.style.setProperty('--article-nav-offset-mobile', h + 'px');
        } else {
          document.documentElement.style.setProperty('--article-nav-offset-desktop', h + 'px');
        }
      });
      window.dispatchEvent(new Event('resize'));

      let observer = new IntersectionObserver(function(entries) {
        if (entries[0].intersectionRatio === 0) {
          _this.classList.add("navigation--sticky");
        } else if (entries[0].intersectionRatio === 1) {
          _this.classList.remove("navigation--sticky");
        }
      }, {
        threshold: [0, 1]
      });

      observer.observe(document.querySelector(".blog-post-detail--sticky"));

      function stretch() {
        const pixelScrolled = window.scrollY;
        const viewportHeight = window.innerHeight;
        const totalHeightScrollable = document.body.scrollHeight;

        // convert pixels to percentage
        const pixelsToPercentage = (pixelScrolled / (totalHeightScrollable - viewportHeight));

        // set the width of the fluid element.
        _this.progress_bar.style.transform = 'scale(' + pixelsToPercentage + ', 1)';
      }

      // append a scroll event listener to the window object
      window.addEventListener('scroll', stretch);
      window.dispatchEvent(new Event('scroll'));
    });
  }
}
customElements.define('article-navigation', ArticleNavigation);