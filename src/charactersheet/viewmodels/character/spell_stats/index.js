import 'bin/knockout-bootstrap-modal';
import {
    CharacterManager,
    Notifications
} from 'charactersheet/utilities';
import { PersistenceService } from 'charactersheet/services/common/persistence_service';
import { SpellStats } from 'charactersheet/models/character';
import { SpellStatsFormViewModel} from './form';
import ko from 'knockout';
import template from './index.html';

export function SpellStatsViewModel() {
    var self = this;

    self.spellStats = ko.observable(new SpellStats());

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

    self.dataHasChanged = function() {
        self.spellStats().save();
        Notifications.spellStats.changed.dispatch();
    };
}

ko.components.register('spell-stats', {
    viewModel: SpellStatsViewModel,
    template: template
});
