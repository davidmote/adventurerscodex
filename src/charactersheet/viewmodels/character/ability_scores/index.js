import 'bin/knockout-bootstrap-modal';
import {
    AbilityScores,
    getModifier,
    getStrModifier } from 'charactersheet/models/character/ability_scores';

import {
    CharacterManager,
    Notifications
} from 'charactersheet/utilities';

import { PersistenceService } from 'charactersheet/services/common/persistence_service';
import { SavingThrows } from 'charactersheet/models/character';

import { find } from 'lodash';

import ko from 'knockout';
import template from './index.html';


export function AbilityScoresViewModel() {
    var self = this;

    self.abilityScores = ko.observable(new AbilityScores());
    self.modalStatus = ko.observable(false);
    self.editItem = ko.observable();
    self.firstModalElementHasFocus = ko.observable(false);
    self.editMode = ko.observable(false);
    self.showSaves = ko.observable(false);


    self.blankSavingThrow = ko.observable(new SavingThrows());
    self.savingThrows = ko.observableArray([]);
    // self.modalOpen = ko.observable(false);
    // self.editItemIndex = null;
    // self.currentEditItem = ko.observable();

    self.toggleSaves = (newValue) => {
        self.showSaves(!self.showSaves());
        // if (self.showSaves() !== newValue) {
        //     self.showSaves(newValue);
        // }
    };
    self._defaultSavingThrows = function() {
        var savingThrows = [
            { name: 'Strength', proficency: false, modifier: null },
            { name: 'Dexterity', proficency: false, modifier: null },
            { name: 'Constitution', proficency: false, modifier: null },
            { name: 'Intelligence', proficency: false, modifier: null },
            { name: 'Wisdom', proficency: false, modifier: null },
            { name: 'Charisma', proficency: false, modifier: null }
        ];
        return savingThrows.map(function(e,i, _) {
            var savingThrow = new SavingThrows();
            e.characterId = CharacterManager.activeCharacter().key();
            savingThrow.importValues(e);
            return savingThrow;
        });
    };



    self.findSaveByName = (name) => {
        const savingThrow = find(self.savingThrows(), (savingthrow)=>{return savingthrow.name() === name;});
        return savingThrow;
    };



    self.editModeIcon = ko.pureComputed(() => (
         this.editMode() ? 'glyphicon-floppy-save' : 'glyphicon-pencil'
    ));

    self.load = function() {

        Notifications.abilityScores.changed.add(self.updateSaveValues);
        Notifications.stats.changed.add(self.updateSaveValues);
        Notifications.global.save.add(self.save);
        var savingThrows = PersistenceService.findBy(SavingThrows, 'characterId',
          CharacterManager.activeCharacter().key());
        if (savingThrows.length > 0) {
            self.savingThrows(savingThrows);
        } else {
            self.savingThrows(self._defaultSavingThrows());
            self.savingThrows().forEach(function(e, i, _) {
                e.characterId(CharacterManager.activeCharacter().key());
            });
            self.save();
        }


        Notifications.global.save.add(self.save);
        var key = CharacterManager.activeCharacter().key();
        var scores = PersistenceService.findBy(AbilityScores, 'characterId', key);
        if (scores.length > 0) {
            self.abilityScores(scores[0]);
        } else {
            self.abilityScores(new AbilityScores());
        }
        self.abilityScores().characterId(key);

        //Subscriptions
        self.abilityScores().str.subscribe(self.dataHasChanged);
        self.abilityScores().dex.subscribe(self.dexterityHasChanged);
        self.abilityScores().con.subscribe(self.dataHasChanged);
        self.abilityScores().int.subscribe(self.intelligenceHasChanged);
        self.abilityScores().wis.subscribe(self.dataHasChanged);
        self.abilityScores().cha.subscribe(self.dataHasChanged);

    };

    self.unload = function() {
        self.save();
        Notifications.global.save.remove(self.save);
        Notifications.abilityScores.changed.remove(self.updateSaveValues);
        Notifications.stats.changed.remove(self.updateSaveValues);
        Notifications.global.save.remove(self.save);

    };

    self.save = function() {
        self.abilityScores().save();
        self.savingThrows().forEach(function(e, i, _) {
            e.save();
        });
    };

    self.updateSaveValues = function() {
        self.savingThrows().forEach(function(e, i, _) {
            e.updateValues();
        });
    };
    self.dataHasChanged = function() {
        self.abilityScores().save();
        Notifications.abilityScores.changed.dispatch();
    };

    self.intelligenceHasChanged = function() {
        self.abilityScores().save();
        Notifications.abilityScores.intelligence.changed.dispatch();
        Notifications.abilityScores.changed.dispatch();
    };

    self.dexterityHasChanged = function() {
        self.abilityScores().save();
        Notifications.abilityScores.dexterity.changed.dispatch();
        Notifications.abilityScores.changed.dispatch();
    };

    // Modal Methods
    self.editItem(new AbilityScores());

    self.editScores = function() {
        if (self.editMode()) {
            self.abilityScores().importValues(self.editItem().exportValues());
            self.editMode(false);
            self.abilityScores().save();
            self.savingThrows().forEach(function(e, i, _) {
                e.save();
            });
        } else {
            self.editItem().importValues(self.abilityScores().exportValues());
            self.editMode(true);
         // Alert the modal even if the value didn't technically change.
            self.modalStatus.valueHasMutated();
        }
    };


    self.openModal = function() {
        self.editItem(new AbilityScores());
        self.editItem().importValues(self.abilityScores().exportValues());

        self.modalStatus(true);
         // Alert the modal even if the value didn't technically change.
        self.modalStatus.valueHasMutated();
    };

    self.modalFinishedAnimating = function() {
        self.firstModalElementHasFocus(true);
        self.firstModalElementHasFocus.valueHasMutated();
    };

    self.modalFinishedClosing = function() {
        if (self.modalStatus()) {
            self.abilityScores().importValues(self.editItem().exportValues());
        }
        self.modalStatus(false);
        self.abilityScores().save();
    };
}

ko.components.register('ability-scores', {
    viewModel: AbilityScoresViewModel,
    template: template
});
