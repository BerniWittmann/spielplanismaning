# [ember-cli-stylist](https://github.com/lifegadget/ember-cli-stylist)
> Ember addon for a dynamic and safe "style" property

![ ](https://travis-ci.org/lifegadget/ember-cli-stylist.svg) [![npm version](https://badge.fury.io/js/ember-cli-stylist.svg)](http://badge.fury.io/js/ember-cli-stylist) ![Code Climate](https://codeclimate.com/github/lifegadget/ember-cli-stylist/badges/gpa.svg)

## Install ##
- Modern CLI versions

    ````bash
    ember install ember-cli-stylist
    ````

## Usage ##
This addon helps component developers to provide HTML style attributes dynamically and safely. To use this just install and then in your component, mixin the `shared-stylist` mixin like so:

```javascript
import SharedStylist from 'ember-cli-stylist/mixins/shared-stylist';
export default Ember.Component.extend(SharedStylist,{
  attributeBindings: ['stylist:style'],
  // your code here
}
```

or as it getting to be more common ...

```javascript
import SharedStylist from 'ember-cli-stylist/mixins/shared-stylist';
export default Ember.Component.extend(SharedStylist,{
  tagName: '',
}
```

```handlebars
<div style={{stylist}}>
  Hello world
</div>
```

You can optionally include a property in your component `styleBindings` which will specify which styles you want  proxied. If you don't specify then the default properties proxied are:

> height width minHeight maxHeight minWidth maxWidth fontSize fontFamily fontWeight cursor display

With the Mixin added your component will now proxy style properties in a safe manner (aka, they will be escaped so XSS attacks are made much harder). For your component called `my-component` a container might use it like so:

    {{my-component width='50%' height='100px' fontWeight=800}}

which would result in the style property being set to:

    <div id="ember456" style="width: 50%; height: 100px; font-weight: 800px">

## Dependencies

None.

## Version Compatibility

This may very well work with older version of Ember and Ember-CLI but it was intended for:

- Ember 1.13.7+
- Ember-CLI 1.13.7+

You can see the CI results at: [Travis Reporting](https://travis-ci.org/lifegadget/ember-cli-stylist)

## Repo Contribution

We're open to your creative suggestions but please move past the "idea" stage
and send us a PR so we can incorporate your ideas without killing ourselves. :)

## Licensing

This component is free to use under the MIT license:

Copyright (c) 2015 LifeGadget Ltd

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
