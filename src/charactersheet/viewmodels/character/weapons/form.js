import ko from 'knockout';
import {debounce} from 'lodash';
import {DataRepository} from 'charactersheet/utilities';
import {Notifications} from 'charactersheet/utilities';
import {PersistenceService} from 'charactersheet/services/common/persistence_service';
import {Weapon} from 'charactersheet/models/common';

import template from './form.html';

export class WeaponFormComponentViewModel {
    constructor(params) {
        this.data = params.data;
        this.showForm = params.showForm;
        this.toggle = params.toggle;
        this.addCallback = params.add;
        this.removeCallback = params.remove;

        this.containerId = ko.utils.unwrapObservable(params.containerId);
        this.currentEditItem = ko.observable();
        this.formElementHasFocus = ko.observable(false);
        this.addForm = ko.observable(false);
        this.bypassUpdate = ko.observable(false);
        this.shouldShowDisclaimer = ko.observable(false);
    }

    load = () => {
        this.currentEditItem(new Weapon());
        if (this.data) {
            this.currentEditItem().importValues(this.data.exportValues());
        } else {
            this.addForm(true);
        }

        this.showForm.subscribe(() => {
            if (this.showForm()) {
                if (this.data) {
                    this.currentEditItem(new Weapon());
                    this.currentEditItem().importValues(this.data.exportValues());
                }
                this.formElementHasFocus(true);
            } else {
                this.formElementHasFocus(false);
                if (this.bypassUpdate()) {
                    this.bypassUpdate(false);
                } else {
                    this.update();
                }
                this.currentEditItem(new Weapon());
            }
        });
    }

    update = () => {
        if (this.data) {
            this.data.importValues(this.currentEditItem().exportValues());
            this.data.save();
        } else {
            this.addCallback(this.currentEditItem())
        }
        Notifications.weapon.changed.dispatch();
    }

    save = () => {
        this.bypassUpdate(true);
        this.update();
        this.toggle();
        this.shouldShowDisclaimer(false);
        this.currentEditItem(new Weapon());
    }

    cancel = (data, event) => {
        this.bypassUpdate(true);
        this.toggle();
        this.shouldShowDisclaimer(false);
        this.currentEditItem(new Weapon());
    }

    remove = () => {
        $(`#${this.containerId}`).collapse('hide');
        setTimeout(() => {
            this.removeCallback(this.data);
            Notifications.weapon.changed.dispatch()
        }, 650);
    }



        weaponsPrePopFilter = (request, response) => {
            var term = request.term.toLowerCase();
            let results = [];
            if (term && term.length > 2) {
            var keys = DataRepository.weapons ? Object.keys(DataRepository.weapons) : [];
            results = keys.filter(function(name, idx, _) {
                return name.toLowerCase().indexOf(term) > -1;
            });
          }
            response(results);
        };

    populateWeapon = (label, value) => {
        var weapon = DataRepository.weapons[label];

        this.currentEditItem().importValues(weapon);
        this.shouldShowDisclaimer(true);
    };

    setWeaponType = (label, value) => {
        this.currentEditItem().weaponType(value);
    };

    setWeaponHandedness = (label, value) => {
        this.currentEditItem().weaponHandedness(value);
    };

    setWeaponProficiency = (label, value) => {
        this.currentEditItem().weaponProficiency(value);
    };

    setWeaponCurrencyDenomination = (label, value) => {
        this.currentEditItem().weaponCurrencyDenomination(value);
    };

    setWeaponDamageType = (label, value) => {
        this.currentEditItem().weaponDamageType(value);
    };

    setWeaponProperty = (label, value) => {
        this.currentEditItem().weaponProperty(value);
    };
    //  Pre-pop methods
    // weaponPrePopFilter = (request, response) => {
    //     const term = request.term.toLowerCase();
    //     let results = [];
    //     if (term && term.length > 2) {
    //         const keys = DataRepository.proficiencies
    //             ? Object.keys(DataRepository.proficiencies)
    //             : [];
    //         results = keys.filter(function(name, idx, _) {
    //             return name.toLowerCase().indexOf(term) > -1;
    //         });
    //     }
    //     response(results);
    // };
    //
    // populateWeapon = (label, value) => {
    //     var weapon = DataRepository.proficiencies[label];
    //     this.currentEditItem().importValues(weapon);
    //     this.shouldShowDisclaimer(true);
    // };
    //
    // setType = (label, value) => {
    //     this.currentEditItem().type(value);
    // };
}

ko.components.register('weapon-form', {
    viewModel: WeaponFormComponentViewModel,
    template: template
});
