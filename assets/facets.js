function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 *  @class
 *  @function FacetsToggle
 */
class FacetsToggle {

  constructor() {
    this.container = document.getElementById('Facet-Drawer');
    let button = document.getElementById('Facets-Toggle');

    // Add functionality to buttons
    if (button) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementsByTagName("body")[0].classList.toggle('open-cc');
        this.container.classList.toggle('active');
      });
    }

  }
}


class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    this.querySelector('form').addEventListener('input', this.debouncedOnSubmit.bind(this));
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    };
    window.addEventListener('popstate', onHistoryChange);

    const onResize = debounce((event) => {
      let root = document.documentElement,
        header = document.querySelector('.header'),
        height = header.clientHeight;

      if (window.innerWidth <= 768) {
        root.style.setProperty('--header-height-mobile', height + "px");
      }
    }, 200);
    window.addEventListener('resize', onResize);
    window.dispatchEvent(new Event('resize'));
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    const container = document.getElementsByClassName('thb-filter-count');
    document.getElementById('ProductGridContainer').querySelector('.collection').classList.add('loading');

    for (var item of container) {
      item.classList.add('loading');
    }

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = element => element.url === url;

      if (FacetFiltersForm.filterData.some(filterDataUrl)) {
        FacetFiltersForm.renderSectionFromCache(filterDataUrl, event);
      } else {
        FacetFiltersForm.renderSectionFromFetch(url, event);
      }
    });
    if (typeof FacetRemove !== 'undefined') {
      // customElements.define('facet-remove', FacetRemove);
    }
    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, {
          html,
          url
        }];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.renderProductCount(html);
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
  }

  static renderProductGridContainer(html) {
    document.getElementById('ProductGridContainer').innerHTML = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductGridContainer').innerHTML;

  }

  static renderProductCount(html) {
    const count = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductCount').innerHTML;
    const container = document.getElementsByClassName('thb-filter-count');

    for (var item of container) {
      item.innerHTML = count;
      item.classList.remove('loading');
    }
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');

    const facetDetailsElements =
      parsedHTML.querySelectorAll('#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter');
    const matchesIndex = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.dataset.index === jsFilter.dataset.index : false;
    };
    const facetsToRender = Array.from(facetDetailsElements).filter(element => !matchesIndex(element));
    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

    facetsToRender.forEach((element) => {
      document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);

    if (countsToRender) FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.active-facets'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    });

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderAdditionalElements(html) {
    const mobileElementSelectors = ['.mobile-filter-count'];

    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });

  }

  static renderCounts(source, target) {
    const targetElement = target.querySelector('.facets__selected');
    const sourceElement = source.querySelector('.facets__selected');

    if (sourceElement && targetElement) {
      target.querySelector('.facets__selected').outerHTML = source.querySelector('.facets__selected').outerHTML;
    }
  }

  static updateURLHash(searchParams) {
    history.pushState({
      searchParams
    }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      }];
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const formData = new FormData(event.target.closest('form'));
    const searchParams = new URLSearchParams(formData);

    if (searchParams.get('filter.v.price.gte') === "0.00") {
      searchParams.delete('filter.v.price.gte');
    }
    if (document.querySelector('.price_slider')) {
      if (searchParams.get('filter.v.price.lte') === parseFloat(document.querySelector('.price_slider').dataset.max).toFixed(2)) {
        searchParams.delete('filter.v.price.lte');
      }
    }
    FacetFiltersForm.renderPage(searchParams.toString(), event);
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url = event.currentTarget.href.indexOf('?') == -1 ? '' : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();


class FacetRemove extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('a').forEach((item) => {
      item.addEventListener('click', (event) => {
        event.preventDefault();
        const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
        form.onActiveFilterClick(event);
      });
    });
  }
}

customElements.define('facet-remove', FacetRemove);

/**
 *  @class
 *  @function PriceSlider
 */
class PriceSlider extends HTMLElement {

  constructor() {
    super();
  }
  connectedCallback() {
    let slider = this.querySelector('.price_slider'),
      amounts = this.querySelector('.price_slider_amount'),
      args = {
        start: [parseFloat(slider.dataset.minValue || 0), parseFloat(slider.dataset.maxValue || slider.dataset.max)],
        connect: true,
        step: 10,
        direction: document.dir,
        range: {
          'min': 0,
          'max': parseFloat(slider.dataset.max)
        }
      },
      event = new CustomEvent('input'),
      form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');

    if (slider.classList.contains('noUi-target')) {
      slider.noUiSlider.destroy();
    }
    noUiSlider.create(slider, args);

    slider.noUiSlider.on('update', function (values) {
      amounts.querySelector('.field__input_min').value = values[0];
      amounts.querySelector('.field__input_max').value = values[1];
    });
    slider.noUiSlider.on('change', function (values) {
      form.querySelector('form').dispatchEvent(event);
    });
  }
}
customElements.define('price-slider', PriceSlider);

window.addEventListener('load', () => {
  new FacetsToggle();
});