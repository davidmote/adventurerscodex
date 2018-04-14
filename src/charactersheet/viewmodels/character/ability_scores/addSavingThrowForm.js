import ko from 'knockout';
import {debounce} from 'lodash';
import {DataRepository} from 'charactersheet/utilities';
import {FormComponentViewModel} from 'charactersheet/utilities';
import {Notifications} from 'charactersheet/utilities';
import {PersistenceService} from 'charactersheet/services/common/persistence_service';
import { SavingThrows } from 'charactersheet/models/character';

import template from './addSavingThrowForm.html';

export class AddSavingThrowFormComponentViewModel extends FormComponentViewModel {

    constructor(params) {
      super(params);
      this.resize = params.resize;
    }
    generateBlank = () => (new SavingThrows());

    notify = () => {
    }

    subscribeToShowForm = () => {
        if (this.showForm()) {
            if (this.data) {
                this.reset();
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
            this.reset();
        }
        setTimeout(this.resize, 250);
    }
}

ko.components.register('add-save-form', {
    viewModel: AddSavingThrowFormComponentViewModel,
    template: template
});
