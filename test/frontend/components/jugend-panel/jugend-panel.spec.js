(function () {
    'use strict';

    var expect = chai.expect;

    describe('Component: Jugend-Panel', function () {
        beforeEach(module('spi.components.jugendpanel.ui'));
        beforeEach(module('htmlModule'));
        var element;
        var scope;
        var $provide;
        var controller;
        var accessLevel = 1;
        var gruppenError = undefined;
        var jugend = {
            _id: 123,
            teams: [
                {
                    _id: 1,
                    name: 'Test Team 1'
                },
                {
                    _id: 2,
                    name: 'Test Team 2'
                },
                {
                    _id: 3,
                    name: 'Test Team 3'
                }
            ],
            gruppen: [{
                _id: 1234,
                name: 'Test Gruppe 1'
            }, {
                _id: 1235,
                name: 'Test Gruppe 2'
            }],
            name: 'Test Jugend',
            color: 'gelb'
        };
        var mockAuth = {
            canAccess: function (level) {
                return accessLevel >= level;
            },
            isAdmin: function () {
                return accessLevel > 0;
            }
        };
        var mockGruppeEditierenDialog = {
            open: function () {
            }
        };
        var bestaetigen = {};
        var mockBestaetigenDialog = {
            open: function (text, fnct, param) {
                bestaetigen.text = text;
                bestaetigen.fnct = fnct;
                bestaetigen.param = param;
                fnct(param);
            }
        };
        var mockSpielplan = {
            createSpielplan: function () {
            }
        };
        var mockState = {
            go: function () {
            },
            includes: function (statename) {
                return statename.indexOf('spi.verwaltung') != -1;
            }
        };

        var mockGruppe;
        var mockJugend;

        beforeEach(module(function (_$provide_) {
            $provide = _$provide_;
        }));

        beforeEach(inject(function ($rootScope, $compile, $q) {
            scope = $rootScope.$new();
            scope.jugendObject = jugend;
            $provide.service('gruppe', function () {
                mockGruppe = {
                    create: function (jugendid, gruppe) {
                        expect(jugendid).to.be.equal(jugend._id);

                        jugend.gruppen.push(gruppe);
                        if (gruppenError) {
                            return $q.reject(gruppenError);
                        }
                        return $q.when(jugend.gruppen);
                    },
                    delete: function (gruppenid) {
                        jugend.gruppen = _.pullAllBy(jugend.gruppen, [{_id: gruppenid}], '_id');

                        return $q.when(jugend.gruppen);
                    }
                };
                return mockGruppe;
            });
            $provide.service('jugend', function () {
                mockJugend = {
                    delete: function () {
                        return $q.when();
                    }
                };
                return mockJugend;
            });
            $provide.service('GruppeEditierenDialog', function () {
                return mockGruppeEditierenDialog;
            });
            bestaetigen = {};
            $provide.service('BestaetigenDialog', function () {
                return mockBestaetigenDialog;
            });
            $provide.service('spielplan', function () {
                return mockSpielplan;
            });
            $provide.service('auth', function () {
                return mockAuth;
            });
            $provide.service('$state', function () {
                return mockState;
            });

            element = $compile('<spi-jugend-panel data-jugend="jugendObject"></spi-jugend-panel>')(scope);
            scope.$digest();
            controller = element.controller("spiJugendPanel");
        }));

        describe('soll im Titel die Jugend angezeigt werden', function () {
            it('soll das Jugend-Label erscheinen', function () {
                var titel = element.find('spi-panel-titel');

                expect(titel.html()).to.contain('<spi-jugend-label');
                expect(titel.html()).to.contain('</spi-jugend-label>');
            });

            it('soll die Jugend an das Jugend-Label übergeben werden', function () {
                expect(controller.jugend).not.to.be.undefined;
                expect(controller.jugend._id).to.be.equal(123);
                expect(controller.jugend.name).to.be.equal('Test Jugend');
            });
        });

        it('die Gruppen der Jugend sollen geladen werden', function () {
            var result = element.find('tbody').children();

            expect(result.length).to.be.equal(2);
            expect(angular.element(result[0]).find('a').text()).to.be.equal('Test Gruppe 1');
            expect(angular.element(result[1]).find('a').text()).to.be.equal('Test Gruppe 2');
        });

        it('die Gruppen sollen einen Link auf die entsprechende Gruppen-Seite haben', function () {
            var result = element.find('tbody').children();

            expect(angular.element(result[0]).find('a').parent().html()).to.contain('data-ui-sref="spi.tgj.gruppe({gruppeid: gruppe._id})"');
            expect(angular.element(result[1]).find('a').parent().html()).to.contain('data-ui-sref="spi.tgj.gruppe({gruppeid: gruppe._id})"');
            expect(angular.element(result[0]).find('a').parent().scope().gruppe._id).to.be.equal(1234);
            expect(angular.element(result[1]).find('a').parent().scope().gruppe._id).to.be.equal(1235);
        });

        describe('Angenommen der Nutzer ist angemeldet', function () {
            before(function () {
                accessLevel = 1;
            });

            after(function () {
                jugend.gruppen = [{
                    _id: 1234,
                    name: 'Test Gruppe 1'
                }, {
                    _id: 1235,
                    name: 'Test Gruppe 2'
                }];
            });

            it('soll ein Button zum Löschen der Jugend angezeigt werden', function () {
                var result = element.find('spi-panel-titel').find('span');

                expect(result).not.to.be.undefined;
                expect(result.find('i').hasClass('fa-remove')).to.be.true;
            });

            it('soll für jede Gruppe ein Icon zum Löschen gezeigt werden', function () {
                var result = angular.element(element.find('tbody').find('i').parent()[0]);

                expect(result).not.to.be.undefined;
                expect(result.find('i').hasClass('fa-remove')).to.be.true;
            });

            it('soll für jede Gruppe ein Icon zum Editieren gezeigt werden', function () {
                var result = angular.element(element.find('tbody').find('i').parent()[1]);

                expect(result).not.to.be.undefined;
                expect(result.find('i').hasClass('fa-pencil')).to.be.true;
            });

            it('soll beim Klick auf Gruppe Löschen ein Bestätigungsdialog erscheinen und die Gruppe gelöscht werden', function () {
                var loeschenIcon = angular.element(element.find('tbody').find('i').parent()[0]);

                var spy_bestaetigen = chai.spy.on(mockBestaetigenDialog, 'open');
                var spy_delete = chai.spy.on(mockGruppe, 'delete');
                expect(spy_bestaetigen).not.to.have.been.called();
                expect(spy_delete).not.to.have.been.called();

                loeschenIcon.triggerHandler('click');
                scope.$apply();

                expect(spy_bestaetigen).to.have.been.called();
                expect(spy_delete).to.have.been.called();
                var result = element.find('tbody').children();
                expect(bestaetigen.param).to.be.equal(1234);
                expect(jugend.gruppen.length).to.be.equal(1);
                expect(result.length).to.be.equal(1);
            });

            it('soll beim Klick auf Gruppe editieren der Editieren-Dialog geöffnet werden', function () {
                var editIcon = angular.element(element.find('tbody').find('i').parent()[1]);
                var spy_edit = chai.spy.on(mockGruppeEditierenDialog, 'open');
                expect(spy_edit).to.not.have.been.called();

                editIcon.triggerHandler('click');
                scope.$apply();

                expect(spy_edit).to.have.been.called();
            });

            it('soll beim Klick auf Jugend Löschen ein Bestätigungsdialog erscheinen und die Jugend gelöscht werden', function () {
                var loeschenIcon = element.find('spi-panel-titel').find('span');

                var spy_bestaetigen = chai.spy.on(mockBestaetigenDialog, 'open');
                var spy_delete = chai.spy.on(mockJugend, 'delete');
                expect(spy_bestaetigen).not.to.have.been.called();
                expect(spy_delete).not.to.have.been.called();

                loeschenIcon.triggerHandler('click');
                scope.$apply();

                expect(spy_bestaetigen).to.have.been.called();
                expect(spy_delete).to.have.been.called();
                expect(element.children().length).to.be.equal(0);
            });
        });

        describe('Angenommen der Nutzer ist nicht angemeldet', function () {
            before(function () {
                accessLevel = 0;
            });

            it('soll der Jugend-Löschen Button nicht sichtbar sein', function () {
                var result = element.find('spi-panel-titel').find('i');

                expect(result).not.to.exist;
            });

            it('soll der Gruppe-Löschen Button nicht sichtbar sein', function () {
                var result = element.find('tbody').find('i');

                expect(result).not.to.exist;
            });

            it('soll der Gruppe-Editieren Button nicht sichtbar sein', function () {
                var result = element.find('tbody').find('i');

                expect(result).not.to.exist;
            });
        });
    });
}());
