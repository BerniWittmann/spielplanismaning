# spielplanismaning
Spielplan - System für die Beachturniere in Ismaning

### Build Status

| Umgebung | Build-Status |
| --- | --- |
| [Testumgebung](http://spielplanismaning-testing.herokuapp.com) | [![Build Status](https://travis-ci.org/BerniWittmann/spielplanismaning.svg?branch=develop)](https://travis-ci.org/BerniWittmann/spielplanismaning) |
| [Produktionsumgebung](http://spielplanismaning.herokuapp.com) | [![Build Status](https://travis-ci.org/BerniWittmann/spielplanismaning.svg?branch=master)](https://travis-ci.org/BerniWittmann/spielplanismaning) |

### CI-Tool

[Travis](https://travis-ci.org/BerniWittmann/spielplanismaning)

### Installation

```
npm install && bower install
```

### Tests

```
gulp test
```

### Server Start

Build
```
gulp build
```

Lokal über gulp 
```
gulp serve
```

oder für Serve aus dem dist
```
gulp serve:dist
````

Alternativ
```
npm start
```