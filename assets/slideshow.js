/**
 *  @class
 *  @function SlideShow
 */

class SlideShow {
  constructor() {
    let _this = this,
      slideshows = document.querySelectorAll('.carousel');

    if (!slideshows) {
      return;
    }
    slideshows.forEach((slideshow) => {

      let dots = slideshow.dataset.dots === 'true',
        slideshow_slides = Array.from(slideshow.querySelectorAll('.carousel__slide')),
        autoplay = slideshow.dataset.autoplay == 'false' ? false : parseInt(slideshow.dataset.autoplay, 10),
        align = slideshow.dataset.align == 'center' ? 'center' : 'left',
        fade = slideshow.dataset.fade == 'true' ? true : false,
        prev_button = slideshow.querySelector('.flickity-prev'),
        next_button = slideshow.querySelector('.flickity-next'),
        custom_dots = slideshow.querySelectorAll('.flickity-custom-dots'),
        animations = [],
        rightToLeft = document.dir === 'rtl',
        currentIndex = 0,
        args = {
          wrapAround: true,
          cellAlign: align,
          pageDots: dots,
          contain: true,
          fade: fade,
          autoPlay: autoplay,
          rightToLeft: rightToLeft,
          prevNextButtons: false,
          cellSelector: '.carousel__slide'
        };
      if (slideshow.classList.contains('image-with-text-slideshow__image')) {
        let main_slideshow = slideshow.parentNode.querySelector('.image-with-text-slideshow__content');
        args.draggable = false;
        args.asNavFor = main_slideshow;
      }
      if (slideshow.classList.contains('image-with-text-slideshow__content')) {
        args.adaptiveHeight = true;
      }
      if (slideshow.classList.contains('testimonials__carousel')) {
        args.on = {
          ready: function () {
            window.dispatchEvent(new Event('resize'));
          }
        };
      }
      if (slideshow.classList.contains('collection-grid__carousel')) {
        if (document.body.classList.contains('animations-true') && typeof gsap !== 'undefined') {
          args.on = {
            scroll: function (progress) {
              let flkSlideWidth = slideshow.querySelectorAll('.collection-card')[0].clientWidth + 25,
                extra_window_space = slideshow.getBoundingClientRect().left;

              this.slides.forEach((the_slide, j) => {

                let scale_amount = 1,
                  translateX_amount = 0,
                  rotate_amount = 0,
                  zindex = 10,
                  opacity_amount = 1,
                  slide = the_slide.cells[0].element,
                  slide_offset = slide.getBoundingClientRect().left;

                if (slide_offset - extra_window_space < 0) {

                  scale_amount = 1 + ((slide_offset - extra_window_space) / 1200);
                  opacity_amount = 1 + ((slide_offset - extra_window_space) / 200);
                  translateX_amount = ((slide_offset - extra_window_space)) * -1;
                  rotate_amount = ((slide_offset - extra_window_space) / 10) * -1;

                } else {
                  scale_amount = 1;
                  opacity_amount = 1;
                  translateX_amount = 0;
                  rotate_amount = 0;
                }

                if (slide_offset + 5 - extra_window_space < 0) {
                  zindex = 5;
                } else {
                  zindex = 10;
                }

                slide.style.zIndex = zindex;

                gsap.set(slide.querySelector('.collection-card--inner'), {
                  'transform': 'perspective(1000px) translateX(' + translateX_amount + 'px) rotateY(' + rotate_amount + 'deg) translateZ(0)',
                  'opacity': opacity_amount
                });

                gsap.set(slide.querySelector('.collection-card__link'), {
                  'transform': 'scale(' + scale_amount + ') translateZ(0)'
                });

              });
            }
          };
        }

      }
      if (slideshow.classList.contains('main-slideshow')) {
        if (slideshow.classList.contains('desktop-height-image') || slideshow.classList.contains('mobile-height-image')) {
          args.adaptiveHeight = true;
        }
        if (document.body.classList.contains('animations-true') && typeof gsap !== 'undefined') {
          _this.prepareAnimations(slideshow, animations);
          args.on = {
            ready: function () {
              _this.animateSlides(0, slideshow, animations);
            },
            change: function (index) {
              let previousIndex = fizzyUIUtils.modulo(this.selectedIndex - 1, this.slides.length);

              _this.animateReverse(previousIndex, slideshow, animations);
              _this.animateSlides(index, slideshow, animations);
            }
          };
        }
      }
      if (slideshow.classList.contains('products')) {
        args.wrapAround = false;
        args.on = {
          ready: function () {
            var flickity = this;
            window.addEventListener('resize.center_arrows', function () {
              _this.centerArrows(flickity, slideshow, prev_button, next_button);
            });
            window.dispatchEvent(new Event('resize.center_arrows'));
          }
        };
      }
      const flkty = new Flickity(slideshow, args);

      slideshow.dataset.initiated = true;


      if (prev_button) {
        prev_button.addEventListener('click', (event) => {
          flkty.previous();
        });
        prev_button.addEventListener('keyup', (event) => {
          flkty.previous();
        });
        next_button.addEventListener('click', (event) => {
          flkty.next();
        });
        next_button.addEventListener('keyup', (event) => {
          flkty.next();
        });
      }

      if (Shopify.designMode) {
        slideshow.addEventListener('shopify:block:select', (event) => {
          let index = slideshow_slides.indexOf(event.target);
          flkty.select(index);
        });
      }
    });

  }
  prepareAnimations(slideshow, animations) {
    if (!slideshow.dataset.animationsReady) {
      document.fonts.ready.then(function () {
        new SplitText(slideshow.querySelectorAll('h1, p:not(.subheading)'), {
          type: 'lines, words',
          linesClass: 'line-child'
        });
        slideshow.querySelectorAll('.slideshow__slide').forEach((item, i) => {
          let tl = gsap.timeline({
            paused: true
          }),
            button_offset = 0;


          animations[i] = tl;

          tl
            .to(item.querySelector('.slideshow__slide-content'), {
              duration: 0,
              autoAlpha: 1
            });
          if (item.querySelector('.subheading')) {
            tl
              .fromTo(item.querySelector('.subheading'), {
                opacity: 0
              }, {
                duration: 0.5,
                opacity: 0.6
              }, 0);

            button_offset += 0.5;
          }
          if (item.querySelector('h1')) {
            let h1_duration = 0.5 + ((item.querySelectorAll('h1 .line-child div').length - 1) * 0.05);
            tl
              .from(item.querySelectorAll('h1 .line-child div'), {
                duration: h1_duration,
                yPercent: '100',
                stagger: 0.05
              }, 0);
            button_offset += h1_duration;
          }
          if (item.querySelector('p:not(.subheading)')) {

            let p_duration = 0.5 + ((item.querySelectorAll('p:not(.subheading) .line-child div').length - 1) * 0.02);
            tl
              .from(item.querySelectorAll('p:not(.subheading) .line-child div'), {
                duration: p_duration,
                yPercent: '100',
                stagger: 0.02
              }, 0);
            button_offset += p_duration;
          }
          if (item.querySelectorAll('.button')) {
            tl
              .fromTo(item.querySelectorAll('.button'), {
                opacity: 0
              }, {
                duration: 0.5,
                opacity: 1,
                stagger: 0.05
              }, '-=0.4');
          }
          item.dataset.timeline = tl;
        });
      });
      slideshow.dataset.animationsReady = true;
    }
  }
  animateSlides(i, slideshow, animations) {
    let flkty = Flickity.data(slideshow),
      active_slide = flkty.selectedElement;
    document.fonts.ready.then(function () {
      animations[i].restart();
    });
  }
  animateReverse(i, slideshow, animations) {
    animations[i].reverse();
  }
  centerArrows(flickity, slideshow, prev_button, next_button) {
    let first_cell = flickity.cells[0],
      max_height = 0,

      image_height = first_cell.element.querySelector('.product-featured-image').clientHeight;

    flickity.cells.forEach((item, i) => {
      if (item.size.height > max_height) {
        max_height = item.size.height;
      }
    });

    if (max_height > image_height) {
      let difference = (max_height - image_height) / -2;

      if (prev_button) {
        prev_button.style.transform = 'translateY(' + difference + 'px)';
      }
      if (next_button) {
        next_button.style.transform = 'translateY(' + difference + 'px)';
      }
    }
  }
}
if (typeof SlideShow !== 'undefined') {
  new SlideShow();
}