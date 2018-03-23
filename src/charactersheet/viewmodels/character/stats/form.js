import ko from 'knockout';
import {debounce} from 'lodash';
import {
    DeathSave,
    Health,
    HitDice,
    HitDiceType,
    Profile
} from 'charactersheet/models/character';
import {DataRepository} from 'charactersheet/utilities';
import {FormComponentViewModel} from 'charactersheet/utilities';
import {Notifications} from 'charactersheet/utilities';
import {PersistenceService} from 'charactersheet/services/common/persistence_service';


import template from './form.html';

export class HealthFormComponentViewModel extends FormComponentViewModel {

    constructor(params) {
      super(params);
      this.hitDieData = ko.utils.unwrapObservable(params.hitDieData);
      this.editHitDiceItem = ko.observable();
    }

    reset = () => {
      this.shouldShowDisclaimer(false);
      this.currentEditItem(new Health());
      this.editHitDiceItem(new HitDiceType());
    }

    generateBlank = () => (new Health());

    notify = () => {
      Notifications.hitDiceType.changed.dispatch();
      Notifications.health.changed.dispatch();
    }

    subscribeToShowForm = () => {
        if (this.showForm()) {
            if (this.data) {
                this.reset();
                this.currentEditItem().importValues(this.data.exportValues());
                this.editHitDiceItem().importValues(this.hitDieData.exportValues());
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
    }


    load = () => {
        this.reset();
        this.currentEditItem().importValues(this.data.exportValues());
        this.editHitDiceItem().importValues(this.hitDieData.exportValues());
        this.showForm.subscribe(this.subscribeToShowForm);
    }

    update = () => {
          this.data.importValues(this.currentEditItem().exportValues());
          this.data.save();
          this.hitDieData.importValues(this.editHitDiceItem().exportValues());
          this.hitDieData.save();
        this.notify()
    }
    setHitDiceType = (label, value) => {
        this.editHitDiceItem().hitDiceType(value);
    };
}

ko.components.register('health-form', {
    viewModel: HealthFormComponentViewModel,
    template: template
});
