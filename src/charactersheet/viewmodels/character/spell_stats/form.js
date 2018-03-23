import 'bin/knockout-bootstrap-modal';
import {
    CharacterManager,
    Notifications
} from 'charactersheet/utilities';
import {FormComponentViewModel} from 'charactersheet/utilities';
import { PersistenceService } from 'charactersheet/services/common/persistence_service';
import { SpellStats } from 'charactersheet/models/character';
import ko from 'knockout';
import template from './form.html';

export class SpellStatsFormViewModel extends FormComponentViewModel {

    generateBlank = () => (new SpellStats());

    notify = () => {
      Notifications.spellStats.changed.dispatch();
    }

    setSpellCastingAbility = (label, value) => {
    this.currentEditItem().spellcastingAbility(label);
};

}

ko.components.register('spell-stats-form', {
    viewModel: SpellStatsFormViewModel,
    template: template
});
