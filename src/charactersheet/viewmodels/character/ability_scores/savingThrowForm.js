import ko from 'knockout';
import {debounce} from 'lodash';
import { filter, find, includes } from 'lodash';

import {AbilityScores, getModifier, getStrModifier} from 'charactersheet/models/character/ability_scores';
import { AddSavingThrowFormComponentViewModel } from './addSavingThrowForm';

import {CharacterManager, Notifications} from 'charactersheet/utilities';
import {DataRepository} from 'charactersheet/utilities';
import {FormComponentViewModel} from 'charactersheet/utilities';
import {PersistenceService} from 'charactersheet/services/common/persistence_service';
import {Proficiency} from 'charactersheet/models/character';
import { SavingThrows } from 'charactersheet/models/character';
import { SortService } from 'charactersheet/services/common';

import template from './savingThrowForm.html';

export class SavingThrowFormComponentViewModel {
    constructor (params) {
      this.data = params.data;
      this.showForm = params.showForm;
      this.toggle = params.toggle;
      this.resizeCallback = params.resizeCallback;
      this.addCallback = params.add;
      this.removeCallback = params.remove;
      this.bypassUpdate = ko.observable(false);
      this.currentEditItem = ko.observableArray([]);
      this.showAddForm = ko.observable(false);
    }

    toggleAddForm = () => {
        if (this.showAddForm()) {
            $('#add-save').collapse('hide');
            this.showAddForm(false);
        } else {
            this.showAddForm(true);
            $('#add-save').collapse('show');
        }
    };


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

    nonStandardSavingThrows = () => {
        const nonstandard = filter(this.currentEditItem(), (savingThrow) => {
            return !includes(['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'], savingThrow.name());
        });
        return SortService.sortAndFilter(nonstandard, { field: 'name', direction: 'asc'}, null);
    };

    add = (newSave) => {
      this.addCallback(newSave);
      this.currentEditItem([...this.currentEditItem(), newSave])
    }
    remove = (saveToRemove) => {
      const savingThrow = find(this.data(), (savingthrow)=>{
          return savingthrow.name() === saveToRemove.name();
        });
          this.removeCallback(savingThrow);
          this.currentEditItem.remove(saveToRemove)
          this.notify();
    }

}

ko.components.register('saving-throw-form', {
    viewModel: SavingThrowFormComponentViewModel,
    template: template
});
