# spielplanismaning
[![GitHub version](https://badge.fury.io/gh/berniwittmann%2Fspielplanismaning.svg)](https://badge.fury.io/gh/berniwittmann%2Fspielplanismaning)
[![Code Climate](https://codeclimate.com/github/BerniWittmann/spielplanismaning/badges/gpa.svg)](https://codeclimate.com/github/BerniWittmann/spielplanismaning)
[![Test Coverage](https://codeclimate.com/github/BerniWittmann/spielplanismaning/badges/coverage.svg)](https://codeclimate.com/github/BerniWittmann/spielplanismaning/coverage)

Spielplan - System für die Beachturniere in Ismaning 

## Dokumentation

Hier findest du die [Dokumentation](https://berniwittmann.github.io/spielplanismaning/#/)

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

### Workflow
1. Neuen Branch von develop erstellen
2. Änderungen in mehreren kleinen Commits auf Branch
3. gulp versioning task ausführen
4. push to origin (inkl. tags)
5. Pull-Request erstellen
6. Pull-Request inkl. squash mergen


