import Em from 'ember';
import ModalContainer from './modal-container';

function findParent(trigger) {
  var parent = trigger.get('parentView');
  if (!parent) return false;
  if (parent instanceof ModalContainer) return parent;
  return findParent(parent);
}

export default Em.Component.extend({

  classNames: ['modal-trigger'],

  attributeBindings: [
    'aria-label',
    'disabled',
    'type'
  ],

  /**
   * We don't want triggers as the target for form submits from focused fields.
   */

  type: 'button',

  /**
   * We aren't using a tagName because we want these to always be
   * buttons. Maybe when web components land for real we can inherit
   * from HTMLButtonElement and get <modal-trigger> :D
   *
   * If you change the tagName you must add tabindex and implement keyboard events
   * like a button.
   *
   * @property tagName
   * @private
   */

  tagName: 'button',

  /**
   * Finds the modal this element controls. If a trigger is a child of
   * the modal, you do not need to specify a "controls" attribute.
   *
   * @method findModal
   * @private
   */

  findModal: function() {
    var parent = findParent(this);
    if (parent) {
      // we don't care about "controls" if we are child
      this.set('modal', parent);
      parent.registerTrigger(this);
    } else {
      // later so that DOM order doesn't matter
      Em.run.schedule('afterRender', this, function() {
        this.set('modal', Em.View.views[this.get('controls')]);
      });
    }
  }.on('willInsertElement'),

  /**
   * Shows or hides the associated modal.
   *
   * @method toggleModalVisibility
   * @private
   */

  toggleModalVisibility: function(event) {
    this.sendAction('on-toggle', this);
    // don't focus if it was a mouse click, cause that's ugly
    var wasMouse = event.clientX && event.clientY;
    this.get('modal').toggleVisibility(this, {focus: !wasMouse});
  }.on('click'),

  /**
   * When a modal closes it will return focus to the trigger that opened
   * it, keeping the user's focus position.
   *
   * @method focus
   * @public
   */

  focus: function() {
    this.$()[0].focus();
  }

});
