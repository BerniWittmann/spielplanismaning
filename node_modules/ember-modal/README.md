# ember-modal

[WAI-ARIA][wai-aria] accessible modal dialog component for [Ember.js][ember].

This is essentially a complete copy/paste job of [ic-modal][ic-modal] but in the form of an ember-cli addon.

## Installation

```bash
# From within your ember-cli project
ember install:addon ember-modal
```

## Usage

### Basic Modal

In its simplest form:

```html
{{#modal-trigger controls="ohai"}}
  open the modal
{{/modal-trigger}}

{{#modal-container id="ohai"}}
  Ohai!
{{/modal-container}}
```

Here are all the bells and whistles:

```html
<!--
  Triggers can live anywhere in your template, just give them the id of
  the modal they control, you can even have multiple triggers for the
  same modal.
-->

{{#modal-trigger controls="tacos"}}
  abrir los tacos
{{/modal-trigger}}

<!--
  The "close-when" attribute can be bound to a controller property. If
  `tacosOrdered` gets set to `true` then the modal will close.

  "open-when" is the same, but opposite.
-->

{{#modal-container id="tacos" close-when=tacosOrdered}}

  <!--
    This is optional, but you really should provide your own title,
    it gets used in the UI and is important for screenreaders to tell the
    user what modal they are in. If you hate it, write some CSS to hide
    it.
  -->

  {{#modal-title}}Tacos{{/modal-title}}

  <!--
    If a trigger lives inside a modal it doesn't need a "controls"
    attribute, it'll just know.

    If you don't provide a trigger inside the modal, you'll get one
    automatically, but if you're translating, you're going to want your
    own.

    Put the text to be read to screenreaders in an "aria-label" attribute
  -->

  {{#modal-trigger aria-label="Cerrar los tacos"}}×{{/modal-trigger}}

  <!-- Finally, just provide some content -->

  <p>
    ¡Los tacos!
  </p>
{{/modal-container}}
```

### Form Modal

One of the most common use-cases for a modal dialog is a form.

```html
<!-- we still use modal-trigger -->
{{#modal-trigger controls="new-user-form"}}
  open
{{/modal-trigger}}

<!-- note this is modal-form -->
{{#modal-form
  id="new-user-form"

  <!--
    map the component's "on-submit" to controller's "submitForm",
    the component handles the submit for you
   -->
  on-submit="submitForm"

  <!--
    if the form is closed w/o being submit, maybe you need to restore
    the old properties of a model, etc.
  -->
  on-cancel="restoreModel"

  <!-- same thing as above -->
  on-invalid-close="handleCloseWhileSaving"

  <!--
    bind component's "awaiting-return-value" to local "saving",
    more on this in the js section
  -->
  awaiting-return-value=saving

}}

  <!-- in here you are already a form, just add your form elements -->

  <fieldset>
    <label for="name">Name</label>
    {{input id="name" value=newUser.name}}
  </fieldset>

  <!-- and put your buttons in the footer -->

  <fieldset>
    <!-- when "awaiting-return-value" is true, "saving" will be also -->
    {{#if saving}}
      saving ...
    {{else}}
      {{#modal-trigger}}Cancel{{/modal-trigger}}
      <button type="submit">Save</button>
    {{/if}}
  </fieldset>

{{/modal-form}}
```

```js
App.ApplicationController = Ember.Controller.extend({

  newUser: {},

  actions: {

    // this will be called when the user submits the form because we
    // mapped it to the "on-submit" actions of the component
    submitForm: function(modal, event) {

      // If you set the event.returnValue to a promise, modal-form
      // will set its 'awaiting-return-value' to true, that's why our
      // `{{#if saving}}` in the template works. You also get an
      // attribute on the component to style it differently, see the css
      // section about that. You don't need to set the `event.returnValue`.
      event.returnValue = ic.ajax.request(newUserUrl).then(function(json) {
        addUser(json);
        this.set('newUser', {});
      }.bind(this));
    },

    // if the user tries to close the component while the
    // `event.returnValue` is stil resolving, this event is sent.
    handleCloseWhileSaving: function(modal) {
      alert("Hold your horses, we're still saving stuff");
    },

    restoreModel: function(modal) {
      this.get('model').setProperties(this.get('modelPropsBeforeEdit'));
    }
  }
});
```

```css
// while the promise is resolving, you can style the elements
#new-user-form[awaiting-return-value] modal-main {
  opacity: 0.5;
}
```

### Overriding Styles

This component ships with some CSS to be usable out-of-the-box, but the
design has been kept pretty minimal. See `templates/modal-css.hbs` to
know what to override for your own design.

### Animations

There is a class "hook" provided to create animations when the a modal
is opened, `after-open`. For example, you could add this CSS to your
stylesheet to create a fade-in effect:

```css
modal-container[is-open] {
  opacity: 0;
  transition: opacity 150ms ease;
}

modal-container[after-open] {
  opacity: 1;
}
```

  [ember]:http://emberjs.com
  [ic-modal]:https://github.com/instructure/ic-modal
  [wai-aria]:http://www.w3.org/TR/wai-aria/roles#dialog