import 'bin/knockout-bootstrap-modal';
import {
    AbilityScores,
    getModifier,
    getStrModifier } from 'charactersheet/models/character/ability_scores';

import {
    CharacterManager,
    Notifications
} from 'charactersheet/utilities';
import { AbilityScoreFormComponentViewModel } from './scoreForm';
import { PersistenceService } from 'charactersheet/services/common/persistence_service';
import { SavingThrowFormComponentViewModel } from './savingThrowForm';
import { SavingThrows } from 'charactersheet/models/character';

import { find } from 'lodash';

import ko from 'knockout';
import template from './index.html';


export function AbilityScoresViewModel(params) {
    var self = this;
    self.tabId = params.tabId;

    self.abilityScores = ko.observable(new AbilityScores());
    self.showSaves = ko.observable(false);
    self.blankSavingThrow = ko.observable(new SavingThrows());
    self.savingThrows = ko.observableArray([]);

    self.toggleSaves = (newValue) => {
        self.showSaves(!self.showSaves());
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

    self.load = function() {
        const key = CharacterManager.activeCharacter().key();
        Notifications.abilityScores.changed.add(self.updateSaveValues);
        Notifications.stats.changed.add(self.updateSaveValues);
        Notifications.global.save.add(self.save);
        var savingThrows = PersistenceService.findBy(SavingThrows, 'characterId',
          key);
        if (savingThrows.length > 0) {
            self.savingThrows(savingThrows);
        } else {
            self.savingThrows(self._defaultSavingThrows());
            self.savingThrows().forEach(function(e, i, _) {
                e.characterId(key);
            });
            self.save();
        }

        var scores = PersistenceService.findBy(AbilityScores, 'characterId', key);
        if (scores.length > 0) {
            self.abilityScores(scores[0]);
        } else {
            self.abilityScores(new AbilityScores());
        }
        self.abilityScores().characterId(CharacterManager.activeCharacter().key());

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
        self.showSaves(false);
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

}

ko.components.register('ability-scores', {
    viewModel: AbilityScoresViewModel,
    template: template
});
