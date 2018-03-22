import ko from 'knockout';
import {debounce} from 'lodash';

export class FormComponentViewModel {
    constructor(params) {
        this.data = ko.utils.unwrapObservable(params.data);
        this.showForm = params.showForm;
        this.toggle = params.toggle;
        this.addCallback = params.add;
        this.removeCallback = params.remove;
        this.resizeCallback = params.resize;

        this.containerId = ko.utils.unwrapObservable(params.containerId);
        this.currentEditItem = ko.observable();
        this.formElementHasFocus = ko.observable(false);
        this.addForm = ko.observable(false);
        this.bypassUpdate = ko.observable(false);
        this.shouldShowDisclaimer = ko.observable(false);
    }

    generateBlank = () => {
      throw('you must provide a template');
    }

    notify = () => {
      throw('you must provide a notification system');
    }

    subscribeToShowForm = () => {
        if (this.showForm()) {
            if (this.data) {
                this.currentEditItem(this.generateBlank());
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
            this.currentEditItem(this.generateBlank());
        }
    }

    load = () => {
        this.currentEditItem(this.generateBlank());
        if (this.data) {
            this.currentEditItem().importValues(this.data.exportValues());
        } else {
            this.addForm(true);
        }
        
        this.showForm.subscribe(this.subscribeToShowForm);
        this.shouldShowDisclaimer.subscribe(()=> {
          setTimeout(this.resizeCallback, 1);
        });
    }

    update = () => {
        if (this.data) {
            this.data.importValues(this.currentEditItem().exportValues());
            this.data.save();
        } else {
            this.addCallback(this.currentEditItem())
        }
        this.notify()
    }

    save = () => {
        this.bypassUpdate(true);
        this.update();
        this.toggle();
        this.shouldShowDisclaimer(false);
        this.currentEditItem(this.generateBlank());
    }

    cancel = (data, event) => {
        this.bypassUpdate(true);
        this.toggle();
        this.shouldShowDisclaimer(false);
        this.currentEditItem(this.generateBlank());
    }

    remove = () => {
        $(`#${this.containerId}`).collapse('hide');
        setTimeout(() => {
            this.removeCallback(this.data);
            this.notify();
        }, 650);
    }
}
