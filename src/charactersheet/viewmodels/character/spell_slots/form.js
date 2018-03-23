import ko from 'knockout';
import {debounce} from 'lodash';
import {DataRepository} from 'charactersheet/utilities';
import {FormComponentViewModel} from 'charactersheet/utilities';
import {Notifications} from 'charactersheet/utilities';
import {PersistenceService} from 'charactersheet/services/common/persistence_service';
import {Proficiency} from 'charactersheet/models/character';
import { Slot } from 'charactersheet/models/character';
import campingTentWhite from 'images/camping-tent.svg';
import meditationWhite from 'images/meditation.svg';
import template from './form.html';

export class SpellSlotFormComponentViewModel extends FormComponentViewModel {

    constructor (params) {
      super(params);
      this.showForm = ko.observable(false);
      this.meditationWhite = meditationWhite;
      this.campingTentWhite = campingTentWhite;
      this.nextSlotLevel = ko.observable();
      if (params.nextSlotLevel) {
        this.nextSlotLevel = params.nextSlotLevel;
      }
    }

    generateBlank = () => (new Slot());

    notify = () => {
        Notifications.spellSlots.changed.dispatch();
    }


    subscribeToShowForm = () => {
        if (this.showForm()) {
            if (this.data) {
                this.currentEditItem(this.generateBlank());
                this.currentEditItem().importValues(this.data.exportValues());
            } else {
              this.currentEditItem().importValues({level: this.nextSlotLevel});
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
        this.showForm = ko.observable(this.showForm);
        this.currentEditItem(this.generateBlank());
        if (this.data) {
            this.currentEditItem().importValues(this.data.exportValues());
        } else {
            this.addForm(true);
            this.currentEditItem().level(this.nextSlotLevel);
        }

        $(`#${this.containerId}`).on('show.bs.collapse', ()=>{
          this.showForm(true);
          this.subscribeToShowForm();
        })
        $(`#${this.containerId}`).on('hidden.bs.collapse', ()=>{
          this.showForm(false);
          this.subscribeToShowForm();
        })
        this.shouldShowDisclaimer.subscribe(()=> {
          setTimeout(this.resizeCallback, 1);
        });
    }
}

ko.components.register('spell-slot-form', {
    viewModel: SpellSlotFormComponentViewModel,
    template: template
});
