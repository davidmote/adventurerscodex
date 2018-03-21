import ko from 'knockout';
import {debounce} from 'lodash';
import {DataRepository} from 'charactersheet/utilities';
import {Notifications} from 'charactersheet/utilities';
import {PersistenceService} from 'charactersheet/services/common/persistence_service';
import { Armor } from 'charactersheet/models/common';

import template from './form.html';

export class ArmorFormComponentViewModel {
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
        this.currentEditItem(new Armor());
        if (this.data) {
            this.currentEditItem().importValues(this.data.exportValues());
        } else {
            this.addForm(true);
        }

        this.showForm.subscribe(() => {
            if (this.showForm()) {
                if (this.data) {
                    this.currentEditItem(new Armor());
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
                this.currentEditItem(new Armor());
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
        Notifications.armor.changed.dispatch();
    }

    save = () => {
        this.bypassUpdate(true);
        this.update();
        this.toggle();
        this.shouldShowDisclaimer(false);
        this.currentEditItem(new Armor());
    }

    cancel = (data, event) => {
        this.bypassUpdate(true);
        this.toggle();
        this.shouldShowDisclaimer(false);
        this.currentEditItem(new Armor());
    }

    remove = () => {
        $(`#${this.containerId}`).collapse('hide');
        setTimeout(() => {
            this.removeCallback(this.data);
            Notifications.armor.changed.dispatch()
        }, 650);
    }

        setArmorType = (label, value) => {
            this.currentEditItem().armorType(value);
        };

        setArmorCurrencyDenomination = (label, value) => {
            this.currentEditItem().armorCurrencyDenomination(value);
        };

        setArmorStealth = (label, value) => {
            this.currentEditItem().armorStealth(value);
        };

        /* Modal Methods */
        armorsPrePopFilter = (request, response)  => {
            const term = request.term.toLowerCase();
            let results = [];
            if (term && term.length > 2) {
              var keys = DataRepository.armors ? Object.keys(DataRepository.armors) : [];
              results = keys.filter(function(name, idx, _) {
                return name.toLowerCase().indexOf(term) > -1;
              });
            }
            response(results);
        };

        populateArmor = (label, value) => {
            const armor = DataRepository.armors[label];
            this.currentEditItem().importValues(armor);
            this.shouldShowDisclaimer(true);
        };

}

ko.components.register('armor-form', {
    viewModel: ArmorFormComponentViewModel,
    template: template
});
