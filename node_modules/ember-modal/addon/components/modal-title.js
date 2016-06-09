import Em from 'ember';

export default Em.Component.extend({

  tagName: 'modal-title',

  attributeBindings: ['aria-hidden'],

  /**
   * Tells the screenreader not to read this element. The modal has its
   * 'aria-labelledby' set to the id of this element so it would be redundant.
   *
   * @property aria-hidden
   */

  'aria-hidden': 'true',

  /**
   * @method registerWithModal
   * @private
   */

  registerWithModal: function() {
    this.get('parentView').registerTitle(this);
  }.on('willInsertElement')

});
