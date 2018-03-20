import ko from 'knockout';
import {debounce} from 'lodash';
import {DataRepository} from 'charactersheet/utilities';
import {Notifications} from 'charactersheet/utilities';
import {PersistenceService} from 'charactersheet/services/common/persistence_service';
import { MagicItem } from 'charactersheet/models/common';

import template from './form.html';

export class MagicItemFormComponentViewModel {
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
        this.currentEditItem(new MagicItem());
        if (this.data) {
            this.currentEditItem().importValues(this.data.exportValues());
        } else {
            this.addForm(true);
        }

        this.showForm.subscribe(() => {
            if (this.showForm()) {
                if (this.data) {
                    this.currentEditItem(new MagicItem());
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
                this.currentEditItem(new MagicItem());
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
        Notifications.proficiency.changed.dispatch();
    }

    save = () => {
        this.bypassUpdate(true);
        this.update();
        this.toggle();
        this.shouldShowDisclaimer(false);
        this.currentEditItem(new MagicItem());
    }

    cancel = (data, event) => {
        this.bypassUpdate(true);
        this.toggle();
        this.shouldShowDisclaimer(false);
        this.currentEditItem(new MagicItem());
    }

    remove = () => {
        $(`#${this.containerId}`).collapse('hide');
        setTimeout(() => {
            this.removeCallback(this.data);
            Notifications.magicItem.changed.dispatch()
        }, 650);
    }

    magicItemsPrePopFilter = (request, response) => {
        var term = request.term.toLowerCase();
        let results = [];
        if (term && term.length > 2) {
          var keys = DataRepository.magicItems ? Object.keys(DataRepository.magicItems) : [];
            results = keys.filter(function(name, idx, _) {
            return name.toLowerCase().indexOf(term) > -1;
          });
        }
        response(results);
    };

    populateMagicItems = (label, value) => {
        var magicItems = DataRepository.magicItems[label];
        this.currentEditItem().importValues(magicItems);
        this.shouldShowDisclaimer(true);
    };

    setMagicItemType = (label, value) => {
        this.currentEditItem().magicItemType(value);
    };

    setMagicItemRarity = (label, value) => {
        this.currentEditItem().magicItemRarity(value);
    };

}

ko.components.register('magic-item-form', {
    viewModel: MagicItemFormComponentViewModel,
    template: template
});
