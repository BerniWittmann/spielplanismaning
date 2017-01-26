(function () {
    'use strict';

    var expect = chai.expect;

    describe('Component: Ansprechpartner Single', function () {
        beforeEach(module('spi.components.ansprechpartner-single.ui'));
        beforeEach(module('htmlModule'));
        var element;
        var scope;
        var controller;
        var ansprechpartner = {
            "_id": "5795079dfebe4a03004bfe2a",
            "name": "Test Name",
            "turnier": "Turnier Name",
            "email": "test@mail.de"
        };
        var $provide;

        var mockAnsprechpartner;
        var mockToastr = {
            error: function () {
            }
        };

        beforeEach(module(function (_$provide_) {
            $provide = _$provide_;
        }));
        var mockSpiel;

        beforeEach(inject(function ($rootScope, $compile, $q) {
            scope = $rootScope.$new();
            scope.ansprechpartner = ansprechpartner;
            mockAnsprechpartner = {
                delete: function () {
                    return $q.when();
                },
                update: function () {
                    return $q.when({
                        "_id": "5795079dfebe4a03004bfe2a",
                        "name": "Test Name Neu",
                        "turnier": "Turnier Name",
                        "email": "test@mail.de"
                    });
                },
                create: function () {
                    return $q.when(ansprechpartner);
                }
            };
            $provide.service('ansprechpartner', function () {
                return mockAnsprechpartner;
            });
            $provide.service('toastr', function () {
                return mockToastr;
            });
            element = $compile('<table><tr data-spi-ansprechpartner-single="ansprechpartner"></tr></table>')(scope);
            scope.$digest();
            controller = element.controller("AnsprechpartnerSingleController");
            compile = $compile;
        }));

        var compile;

        function recompile() {
            element = compile('<table><tr data-spi-single-spiel="spiel"></tr></table>')(scope);
        }

        it('Der Ansprechpartner wird geladen', function () {
            var result = element.find('tr').find('td');

            expect(angular.element(result[0]).text()).to.contain('Test Name');
            expect(angular.element(result[1]).text()).to.contain('test@mail.de');
            expect(angular.element(result[2]).text()).to.contain('Turnier Name');
        });

        it('Es soll einen Button zum Verschicken einer E-Mail geben', function () {
            var result = angular.element(element.find('tr').find('td')[1]).find('a');

            expect(result).to.exist;
            expect(result.attr('href')).to.equal("mailto:test@mail.de");
        });

        it('Es wird ein Bearbeiten Button angezeigt', function () {
            var result = angular.element(element.find('tr').find('td')[3]).find('a');

            expect(result).to.exit;
            expect(result.find('i').hasClass('fa-pencil')).to.be.true;
        });

        it('Beim Klick auf Bearbeiten, wird in den Bearbeitungsmodus gewechselt', function () {
            var button = angular.element(element.find('tr').find('td')[3]).find('a');
            button.triggerHandler('click');
            scope.$apply();

            expect(angular.element(element.find('tr').find('td')[3]).find('a')).to.not.exist;
        });

        describe('im Bearbeitungsmodus', function () {
            beforeEach(function () {
                var button = angular.element(element.find('tr').find('td')[3]).find('a');
                button.triggerHandler('click');
                scope.$apply();
            });

            it('werden Eingabe Felder angezeigt', function () {
                var result = element.find('tr').find('td').find('input');

                expect(result).to.have.lengthOf(3);
            });

            it('wird ein Löschen Button angezeigt', function () {
                var result = angular.element(element.find('tr').find('td')[3]).find('button.btn-danger');

                expect(result.find('i')).to.exist;
                expect(result.find('i').hasClass('fa-trash')).to.be.true;
            });

            it('wird ein Speichern Button angezeigt', function () {
                var result = angular.element(element.find('tr').find('td')[3]).find('button.btn-success');

                expect(result.find('i')).to.exist;
                expect(result.find('i').hasClass('fa-check')).to.be.true;
            });

            it('beim Klick auf Löschen, soll der Eintrag gelöscht werden', function () {
                var spy = chai.spy.on(mockAnsprechpartner, 'delete');

                var button = angular.element(element.find('tr').find('td')[3]).find('button.btn-danger');
                button.triggerHandler('click');

                expect(spy).to.have.been.called.with(ansprechpartner._id);
            });

            it('Beim Klick auf Speichern, soll der Eintrag gespeichert werden', function () {
                var spy = chai.spy.on(mockAnsprechpartner, 'update');

                var button = angular.element(element.find('tr').find('td')[3]).find('button.btn-success');
                button.triggerHandler('click');

                expect(spy).to.have.been.called();
                expect(angular.element(element.find('tr').find('td')[0]).text()).to.contain('Test Name Neu');
            });

            describe('Bei einem neuen Eintrag', function () {
                before(function () {
                    delete ansprechpartner['_id'];
                });

                it('soll kein Löschen Button angezeigt werden', function () {
                    var result = angular.element(element.find('tr').find('td')[3]).find('button.btn-danger');

                    expect(result).not.exist;
                });

                it('soll beim Klick auf Speichern der Eintrag erstellt werden', function () {
                    var spy = chai.spy.on(mockAnsprechpartner, 'create');

                    var button = angular.element(element.find('tr').find('td')[3]).find('button.btn-success');
                    button.triggerHandler('click');

                    expect(spy).to.have.been.called();
                });
            });
        });
    });
}());
