/**
 *  @class
 *  @function ImageTextOverlay
 */

if (!customElements.get('image-with-text-overlay')) {
 	class ImageTextOverlay extends HTMLElement {
	  constructor() {
			super();
	  }
		connectedCallback() {
			if ( document.body.classList.contains('animations-true') && typeof gsap !== 'undefined') {
				this.prepareAnimations();
			}
		}
		prepareAnimations() {
			let section = this,
					tl = gsap.timeline({
		      scrollTrigger: {
		        trigger: section,
		        start: "top center"
		      }
		    }),
				button_offset = 0;

			document.fonts.ready.then(function() {
				new SplitText( section.querySelectorAll('h3, p:not(.subheading)'), {
						type: 'lines, words',
						linesClass: 'line-child'
					}
				);

				if ( section.querySelector('.subheading')) {
					tl
						.fromTo( section.querySelector('.subheading'), {
							opacity: 0
						}, {
							duration: 0.5,
							opacity: 0.6
						}, 0);

					button_offset += 0.5;
				}
				if ( section.querySelector('h3')) {
					let h3_duration = 0.7 + ( ( section.querySelectorAll('h3 .line-child div').length - 1 ) * 0.05 );
					tl
						.from( section.querySelectorAll('h3 .line-child div'), {
							duration: h3_duration,
							yPercent: '100',
							stagger: 0.05
						}, 0);
					button_offset += h3_duration;
				}
				if ( section.querySelector('p')) {
					let p_duration = 0.7 + ( ( section.querySelectorAll('p .line-child div').length - 1 ) * 0.02 );
					tl
					.from( section.querySelectorAll('p .line-child div'), {
						duration: p_duration,
						yPercent: '100',
						stagger: 0.02
					}, 0);
					button_offset += p_duration;
				}
				if ( section.querySelectorAll('.button')) {
					let i = 1;
					section.querySelectorAll('.button').forEach((item) => {
						tl.fromTo( item, {
								autoAlpha: 0
							}, {
								duration: 0.5,
								autoAlpha: 1
							}, ((button_offset * 0.4 ) + (i-1) * 0.1));
						i++;
					});
				}

			});
		}
	}
	customElements.define('image-with-text-overlay', ImageTextOverlay);
}
