/**
 *  @class
 *  @function  Blog
 */

class Blog {
	constructor() {
    this.select = document.getElementById('blog-header--tags-select');
		this.setupEventListeners();
  }
	setupEventListeners() {
		this.select.addEventListener('change', this.onChange);
	}
	onChange(event) {
		window.location.href = this.value;
  }
}
window.addEventListener('load', () => {
	if (typeof Blog !== 'undefined') {
		new Blog();
	}
});
