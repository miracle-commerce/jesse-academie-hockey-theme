/**
 *  @class
 *  @function FreeShipping
 */

if (!customElements.get('free-shipping')) {
  class FreeShipping extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {

      let amount_text = this.querySelector('.free-shipping--text span');
      let total = parseInt(this.dataset.cartTotal, 10);
      let minimum = Math.round(parseInt(this.dataset.minimum, 10) * (Shopify.currency.rate || 1));
      let percentage = 1;
      this.remainingText = this.querySelector('.free-shipping--text-remaining');
      this.fullText = this.querySelector('.free-shipping--text-full');
      if (total < minimum) {
        percentage = total / minimum;

        if (amount_text) {
          let remaining = minimum - total,
            format = window.theme.settings.money_with_currency_format || "${{amount}}";
          amount_text.innerHTML = formatMoney(remaining, format);
        }
        this.remainingText.style.display = 'block';
        this.fullText.style.display = 'none';
      } else {
        this.remainingText.style.display = 'none';
        this.fullText.style.display = 'block';
      }

      this.style.setProperty('--percentage', percentage);

    }
  }
  customElements.define('free-shipping', FreeShipping);
}