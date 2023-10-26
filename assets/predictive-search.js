/**
 *  @class
 *  @function PredictiveSearch
 */
class PredictiveSearch {
  constructor() {
    this.container = document.querySelector('.thb-quick-search');
    this.button = document.getElementById('quick-search');
    this.close_button = this.container.querySelector('.thb-search-close');
    this.input = this.container.querySelector('input[type="search"]');
    this.predictiveSearchResults = this.container.querySelector('.thb-quick-search--results');

    this.setupEventListeners();
  }

  setupEventListeners() {
    const form = this.container.querySelector('form.searchform');
    form.addEventListener('submit', this.onFormSubmit.bind(this));

    this.input.addEventListener('input', debounce((event) => {
      this.onChange(event);
    }, 300).bind(this));

    this.button.addEventListener('click', (event) => {
      var _this = this;
      event.preventDefault();
      document.querySelector('.header-section').classList.toggle('search-open');

      if (document.querySelector('.header-section').classList.contains('search-open')) {
        setTimeout(function() {
          _this.input.focus({
            preventScroll: true
          });
        }, 100);
        dispatchCustomEvent('search:open');
      }

      return false;
    });

    // Close.
    this.close_button.addEventListener('click', (event) => {
      this.close();
      event.preventDefault();
    });
    document.addEventListener('keyup', (event) => {
      if (event.key === 'Escape') {
        this.close();
      }
    });
  }

  categoryToggle() {
    this.category_toggle = this.container.querySelectorAll('.search-categories a');

    this.category_toggle.forEach((link) => {
      link.addEventListener('click', (event) => {
        [].forEach.call(this.category_toggle, function(el) {
          el.classList.remove('active');
        });
        link.classList.add('active');
        let target = link.getAttribute('href');
        this.container.querySelectorAll('.search-results').forEach((section) => {
          section.classList.remove('active');
        });
        this.container.querySelector(target).classList.add('active');

        event.preventDefault();
      });
    });

  }

  getQuery() {
    return this.input.value.trim();
  }

  onChange() {
    const searchTerm = this.getQuery();

    if (!searchTerm.length) {
      this.predictiveSearchResults.classList.remove('active');
      return;
    }

    this.getSearchResults(searchTerm);
  }

  onFormSubmit(event) {
    if (!this.getQuery().length) {
      event.preventDefault();
    }
  }

  onFocus() {
    const searchTerm = this.getQuery();

    if (!searchTerm.length) {
      return;
    }

    this.getSearchResults(searchTerm);
  }

  getSearchResults(searchTerm) {
    const queryKey = searchTerm.replace(" ", "-").toLowerCase();

    this.predictiveSearchResults.classList.add('loading');

    fetch(`${theme.routes.predictive_search_url}?q=${encodeURIComponent(searchTerm)}&${encodeURIComponent('resources[type]')}=product,article,query&${encodeURIComponent('resources[limit]')}=10&section_id=predictive-search`)
      .then((response) => {
        this.predictiveSearchResults.classList.remove('loading');
        if (!response.ok) {
          var error = new Error(response.status);
          this.close();
          throw error;
        }

        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector('#shopify-section-predictive-search').innerHTML;

        this.renderSearchResults(resultsMarkup);
      })
      .catch((error) => {
        throw error;
      });
  }

  renderSearchResults(resultsMarkup) {
    this.predictiveSearchResults.innerHTML = resultsMarkup;

    this.predictiveSearchResults.classList.add('active');

    this.categoryToggle();
  }

  open() {
    document.querySelector('.header-section').classList.add('search-open');
  }

  close() {
    document.querySelector('.header-section').classList.remove('search-open');
  }
}
window.addEventListener('load', () => {
  if (typeof PredictiveSearch !== 'undefined') {
    new PredictiveSearch();
  }
});