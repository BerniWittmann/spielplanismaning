(function () {
    'use strict';

    var expect = chai.expect;

    describe('Component: Navigation', function () {
        beforeEach(module('spi.components.navigation.ui'));
        beforeEach(module('htmlModule'));
        var element;
        var scope;
        var controller;

        var mockState = {
            currentStateName: 'spi.home',
            go: function () {
            },
            includes: function (name) {
                return _.isEqual(name, mockState.currentStateName);
            },
            current: {
                name: 'spi.home'
            },
            href: function () {}
        };
        var mockVeranstaltungen = {
            getCurrentEvent: function () {
                return {name: 'Event'};
            }
        };
        var mockAuth = {
            userLoggedIn: true,
            userAccessLevel: 999,
            isLoggedIn: function () {
                return mockAuth.userLoggedIn;
            },
            canAccess: function (n) {
                return mockAuth.userAccessLevel >= n;
            },
            isAdmin: function () {
                return mockAuth.userAccessLevel > 0;
            },
            isBearbeiter: function () {
                return mockAuth.userAccessLevel == 0;
            },
            currentUser: function () {
                return 'Berni'
            },
            logOut: function () {
            }
        };
        var mockSpielplan = {
            progress: 0,
            maxProgress: 0
        };
        var $provide;

        beforeEach(module(function (_$provide_) {
            $provide = _$provide_;
        }));

        beforeEach(inject(function ($rootScope, $compile) {
            scope = $rootScope.$new();
            $provide.value('$state', mockState);
            $provide.value('auth', mockAuth);
            $provide.value('spielplan', mockSpielplan);
            $provide.value('veranstaltungen', mockVeranstaltungen);

            element = $compile('<spi-navigation></spi-navigation>')(scope);
            scope.$digest();
            controller = element.controller("spiNavigation");
        }));

        it('soll die Navigationsleiste laden', function () {
            var result = element.find('nav');
            expect(result).to.exist;
            expect(result.length).to.be.above(0);
            expect(result.hasClass('navbar')).to.be.true;
        });

        it('soll den Menüpunkt Home anzeigen', function () {
            var result = element.find('#nav-button-home');
            expect(result).to.exist;
            expect(result.text()).to.include('Aktuell');
            expect(result.find('a')).to.have.attr('data-ui-sref', 'spi.event.home');
        });

        it('soll den Menüpunkt Spielplan anzeigen', function () {
            var result = element.find('#nav-button-spielplan');
            expect(result).to.exist;
            expect(result.text()).to.include('Spielplan');
            expect(result.find('a')).to.have.attr('data-ui-sref', 'spi.event.spielplan');
        });

        it('soll den Menüpunkt Teams, Gruppen, Jugenden anzeigen', function () {
            var result = element.find('#nav-button-tgj');
            expect(result).to.exist;
            expect(result.text()).to.include('Teams, Gruppen & Turniere');
        });

        describe('Dropdown Teams, Gruppen Jugenden', function () {
            it('soll den Link Teams anzeigen', function () {
                var result = element.find('#nav-button-tgj-teams');
                expect(result).to.exist;
                expect(result.text()).to.include('Teams');
                expect(result.find('a')).to.have.attr('data-ui-sref', 'spi.event.tgj.teams');
            });

            it('soll den Link Gruppen anzeigen', function () {
                var result = element.find('#nav-button-tgj-gruppen');
                expect(result).to.exist;
                expect(result.text()).to.include('Gruppen');
                expect(result.find('a')).to.have.attr('data-ui-sref', 'spi.event.tgj.gruppen');
            });

            it('soll den Link Jugenden anzeigen', function () {
                var result = element.find('#nav-button-tgj-jugenden');
                expect(result).to.exist;
                expect(result.text()).to.include('Turniere');
                expect(result.find('a')).to.have.attr('data-ui-sref', 'spi.event.tgj.jugenden');
            });
        });

        it('soll den Menüpunkt Tabellen anzeigen', function () {
            var result = element.find('#nav-button-tabellen');
            expect(result).to.exist;
            expect(result.text()).to.include('Tabelle');
            expect(result.find('a')).to.have.attr('data-ui-sref', 'spi.event.tabellen');
        });

        describe('Der Nutzer ist nicht eingeloggt', function () {
            before(function () {
                mockAuth.userAccessLevel = -1;
                mockAuth.userLoggedIn = false;

            });

            it('soll den Menüpunkt Verwaltung nicht anzeigen', function () {
                var result = element.find('#nav-button-verwaltung');
                expect(result).not.to.exist;
            });

            it('soll den Login-Button anzeigen', function () {
                var result = element.find('#nav-button-login');
                expect(result).to.exist;
                expect(result.text()).to.include('Login');
            });
        });

        describe('Der Nutzer ist eingeloggt', function () {
            before(function () {
                mockAuth.userAccessLevel = 999;
                mockAuth.userLoggedIn = true;
            });

            it('soll den Menüpunkt Verwaltung anzeigen', function () {
                var result = element.find('#nav-button-verwaltung');
                expect(result).to.exist;
            });

            describe('Dropdown Verwaltung', function () {
                it('soll den Link Gruppen anzeigen', function () {
                    var result = element.find('#nav-button-verwaltung-teams');
                    expect(result).to.exist;
                    expect(result.text()).to.include('Teams, Gruppen & Turniere');
                    expect(result.find('a')).to.have.attr('data-ui-sref', 'spi.event.verwaltung.teams');
                });

                it('soll den Link Spiele-Druck anzeigen', function () {
                    var result = element.find('#nav-button-verwaltung-spieledruck');
                    expect(result).to.exist;
                    expect(result.text()).to.include('Spiele Drucken');
                    expect(result.find('a')).to.have.attr('data-ui-sref', 'spi.event.verwaltung.spiele-druck');
                });

                it('soll den Link Email-Abonnements anzeigen', function () {
                    var result = element.find('#nav-button-verwaltung-emails');
                    expect(result).to.exist;
                    expect(result.text()).to.include('Email Abonnements');
                    expect(result.find('a')).to.have.attr('data-ui-sref', 'spi.event.verwaltung.email-abonnements');
                });
            });

            it('soll den Namen des Nutzers zeigen', function () {
                var result = element.find('#nav-button-user');
                expect(result).to.exist;
                expect(result.text()).to.include('Berni');
            });

            it('soll den Logout-Button zeigen', function () {
                var result = element.find('#nav-button-logout');
                expect(result).to.exist;
                expect(result.text()).to.include('Logout');
            });
        });
    });
}());
