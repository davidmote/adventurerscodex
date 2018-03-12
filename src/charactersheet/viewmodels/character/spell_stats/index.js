import 'bin/knockout-bootstrap-modal';
import {
    CharacterManager,
    Notifications
} from 'charactersheet/utilities';
import { PersistenceService } from 'charactersheet/services/common/persistence_service';
import { SpellStats } from 'charactersheet/models/character';
import ko from 'knockout';
import template from './index.html';

export function SpellStatsViewModel() {
    var self = this;

    self.spellStats = ko.observable(new SpellStats());
    self.modalStatus = ko.observable(false);
    self.editItem = ko.observable(new SpellStats());
    self.firstModalElementHasFocus = ko.observable(false);
    self.editMode = ko.observable(false);
    self.elementHeight = ko.observable('400px');

    const PANEL_ID = '#spell-stats-panel';

    self.setNewHeight = function () {
        let setHeight = 0;
        if (self.editMode()) {
            setHeight = $(`${PANEL_ID} .back`).height();
        } else {
            setHeight = $(`${PANEL_ID} .front`).height();
        }
        if (setHeight > 0) {
            self.elementHeight(setHeight.toString()+'px');
        }
    };
    // Wait for page load
    setTimeout(self.setNewHeight,0);

    // self.editSpellStats = function() {
    //     self.modalStatus(true);
    //     self.editItem(new SpellStats());
    //     self.editItem().importValues(self.spellStats().exportValues());
    // };
    //
    // self.modalFinishedAnimating = function() {
    //     self.firstModalElementHasFocus(true);
    //     self.firstModalElementHasFocus.valueHasMutated();
    // };
    //
    // self.modalFinishedClosing = function() {
    //     if (self.modalStatus()) {
    //         self.spellStats().importValues(self.editItem().exportValues());
    //     }
    //     self.dataHasChanged();
    //     self.modalStatus(false);
    // };


    self.editStats = function() {
        if (self.editMode()) {
            self.spellStats().importValues(self.editItem().exportValues());
            self.dataHasChanged();
            self.editMode(false);
        } else {
            self.editItem(new SpellStats());
            self.editItem().importValues(self.spellStats().exportValues());
            self.editMode(true);
            self.firstModalElementHasFocus(true);
            self.firstModalElementHasFocus.valueHasMutated();
        }
    };

    self.load = function() {
        Notifications.global.save.add(self.save);

        var key = CharacterManager.activeCharacter().key();
        var stats = PersistenceService.findBy(SpellStats, 'characterId', key);
        if (stats.length > 0) {
            self.spellStats(stats[0]);
        } else {
            self.spellStats(new SpellStats());
        }
        self.spellStats().characterId(key);
        self.spellStats().spellAttackBonus.subscribe(self.dataHasChanged);
        self.setNewHeight();
    };

    self.unload = function() {
        self.save();
        Notifications.global.save.remove(self.save);
    };

    self.save = function() {
        self.spellStats().save();
    };

    self.clear = function() {
        self.spellStats().clear();
    };

    self.setSpellCastingAbility = function(label, value) {
        self.editItem().spellcastingAbility(label);
    };

    self.editMode.subscribe(self.setNewHeight);

    // Modal Methods

    self.editSpellStats = function() {
        self.modalStatus(true);
        self.editItem(new SpellStats());
        self.editItem().importValues(self.spellStats().exportValues());
    };

    self.modalFinishedAnimating = function() {
        self.firstModalElementHasFocus(true);
        self.firstModalElementHasFocus.valueHasMutated();
    };

    self.modalFinishedClosing = function() {
        if (self.modalStatus()) {
            self.spellStats().importValues(self.editItem().exportValues());
        }
        self.dataHasChanged();
        self.modalStatus(false);
    };

    self.dataHasChanged = function() {
        self.spellStats().save();
        Notifications.spellStats.changed.dispatch();
    };
}

ko.components.register('spell-stats', {
    viewModel: SpellStatsViewModel,
    template: template
});
