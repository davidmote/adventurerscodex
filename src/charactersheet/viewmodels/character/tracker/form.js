import ko from 'knockout';
import {debounce} from 'lodash';
import {DataRepository} from 'charactersheet/utilities';
import {Notifications} from 'charactersheet/utilities';
import {PersistenceService} from 'charactersheet/services/common/persistence_service';
import { Tracked } from 'charactersheet/models/character';
import meditationWhite from 'images/meditation.svg';
import campingTentWhite from 'images/camping-tent.svg';

import template from './form.html';

export class TrackedFormComponentViewModel {
    constructor(params) {

        this.data = ko.utils.unwrapObservable(params.data);
        this.showForm = params.showForm;
        this.toggle = params.toggle;
        this.containerId = ko.utils.unwrapObservable(params.containerId);
        this.currentEditItem = ko.observable();

        this.formElementHasFocus = ko.observable(false);
        this.addForm = ko.observable(false);
        this.bypassUpdate = ko.observable(false);
        this.shouldShowDisclaimer = ko.observable(false);

        this.meditationWhite = meditationWhite;
        this.campingTentWhite = campingTentWhite;

    }

    load = () => {
        this.currentEditItem(new Tracked());
        if (this.data) {
            this.currentEditItem().importValues(this.data.exportValues());
        } else {
            this.addForm(true);
        }

        this.showForm.subscribe(() => {
            if (this.showForm()) {
                if (this.data) {
                    this.currentEditItem(new Tracked());
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
                this.currentEditItem(new Tracked());
            }
        });
    }

    update = () => {
        if (this.data) {
            this.data.importValues(this.currentEditItem().exportValues());
            this.currentEditItem(new Tracked());
        } else {
            this.addCallback(this.currentEditItem())
        }
        Notifications.tracked.changed.dispatch();
    }

    save = () => {
        this.toggle();
    }

    cancel = (data, event) => {
        this.bypassUpdate(true);
        this.toggle();
        this.currentEditItem(new Tracked());
    }

}

ko.components.register('tracked-form', {
    viewModel: TrackedFormComponentViewModel,
    template: template
});
