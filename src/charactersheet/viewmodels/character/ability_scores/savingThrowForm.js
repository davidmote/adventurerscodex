import ko from 'knockout';
import {debounce} from 'lodash';
import {find} from 'lodash';

import {AbilityScores, getModifier, getStrModifier} from 'charactersheet/models/character/ability_scores';

import {CharacterManager, Notifications} from 'charactersheet/utilities';
import {DataRepository} from 'charactersheet/utilities';
import {FormComponentViewModel} from 'charactersheet/utilities';
import {PersistenceService} from 'charactersheet/services/common/persistence_service';
import {Proficiency} from 'charactersheet/models/character';
import { SavingThrows } from 'charactersheet/models/character';

import template from './savingThrowForm.html';

export class SavingThrowFormComponentViewModel {
    constructor (params) {
      this.data = params.data;
      this.showForm = params.showForm;
      this.toggle = params.toggle;
      this.bypassUpdate = ko.observable(false);
      this.currentEditItem = ko.observableArray([]);
    }

    load = () => {
      this.buildSaves();
      this.showForm.subscribe(this.subscribeToShowForm);
    }

    generateBlank = () => ([]);

    buildSaves = () => {
      const saves = ko.utils.unwrapObservable(this.data);
      this.currentEditItem([...saves.map(savt => {
        const newSave = new SavingThrows();
        newSave.importValues(savt.exportValues())
        return newSave;
      })]);
    }

    findSaveByName = (name) => {
        const savingThrow = find(this.currentEditItem(), (savingthrow)=>{
            return savingthrow.name() === name;
          });
        return savingThrow;
    };

    notify = () => {
        // Notifications.abilityScores.changed.dispatch();
    }

    subscribeToShowForm = () => {
        if (this.showForm()) {
            if (this.data) {
              this.buildSaves();
            }
        } else {
            if (this.bypassUpdate()) {
                this.bypassUpdate(false);
            } else {
                this.update();
            }
            this.currentEditItem(this.generateBlank());
        }
    }

    update = () => {
        if (this.data) {
            this.data().forEach((saveData) => {
            const modifiedSave = this.findSaveByName(saveData.name());
            saveData.importValues(modifiedSave.exportValues());
              saveData.save();
          });
        }
        this.notify();
    }

    save = () => {
        this.bypassUpdate(true);
        this.update();
        this.toggle();
        this.currentEditItem(this.generateBlank());
    }

    // cancel = (data, event) => {
    //     this.bypassUpdate(true);
    //     this.toggle();
    //     this.shouldShowDisclaimer(false);
    //     this.currentEditItem(this.generateBlank());
    // }

    // remove = () => {
    //     $(`#${this.containerId}`).collapse('hide');
    //     setTimeout(() => {
    //         this.removeCallback(this.data);
    //         this.notify();
    //     }, 650);
    // }

}

ko.components.register('saving-throw-form', {
    viewModel: SavingThrowFormComponentViewModel,
    template: template
});
