# SimIt

Simulate keyboard/mouse events in the browser.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

### Features

* Simulate a sequence of keyboard/mouse events
* Repeat an event
* Events
    * click
    * keydown
    * keyup
    * keypress
    * sleep


### Install

```
git clone https://github.com/RetroVX/SimIt.git
```
Or download from Zip

#### Node & Common
```javascript
const SimIt = require('./path/to/simit.js');

const simit = new SimIt();
```

#### Module
```javascript
import SimIt from "./path/to/simit.mjs";

const simit = new SimIt();
```

#### UMD
```html
<script type="text/javascript" src="path/to/simit.umd.js"></script>
```
```javascript
const simit = new window.simit();
```

### Examples

#### Simulate a sequence of events
```javascript
simit.all([
    { keydown: 'h' },
    { keydown: 'i' },
    { sleep: 1000 },
    { click: { x: 100, y: 250 } },
    { callback: function() { console.log('callback'); } },
    { repeat: { event: { keydown: 'y' }, amount: 10, delay: 500 } },
], onStart, onComplete);

function onStart(sequence) {
    console.log('sequence started');
}

function onComplete(sequence) {
    console.log('sequence finished')
}
```

#### Repeat an event
```javascript
// repeat click 10 times with a 500ms delay between each click
simit.repeat({ click: { x: 100, y: 150 } }, 10, 500);
```

#### Events
```javascript
simit.click(150, 250);

simit.keydown('h');

simit.keyup('i'),

simit.keypress('j');

simit.sleep(1000);
```

#### Set element
```javascript
const element = document.querySelector('myElement');
simit.setElement(element);

// setElement is chainable
simit.setElement(element).repeat({ keypress: 'c' }, 5);
```

#### Browser Support
This library works well with Chrome but due to browser support, ie and safari are not supported