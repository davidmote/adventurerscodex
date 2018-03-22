import ko from 'knockout';
import {debounce} from 'lodash';
import { find } from 'lodash';

import {
    AbilityScores,
    getModifier,
    getStrModifier } from 'charactersheet/models/character/ability_scores';

import {
    CharacterManager,
    Notifications
} from 'charactersheet/utilities';
import {DataRepository} from 'charactersheet/utilities';
import {FormComponentViewModel} from 'charactersheet/utilities';
import {PersistenceService} from 'charactersheet/services/common/persistence_service';
import {Proficiency} from 'charactersheet/models/character';

import template from './scoreForm.html';

export class AbilityScoreFormComponentViewModel extends FormComponentViewModel {

    generateBlank = () => (new AbilityScores());

    notify = () => {
        Notifications.abilityScores.changed.dispatch();
    }

    remove = () => {
    }
}

ko.components.register('ability-score-form', {
    viewModel: AbilityScoreFormComponentViewModel,
    template: template
});
