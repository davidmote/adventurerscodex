import ko from 'knockout';
import {debounce} from 'lodash';
import {DataRepository} from 'charactersheet/utilities';
import {FormComponentViewModel} from 'charactersheet/utilities';
import {Notifications} from 'charactersheet/utilities';
import {PersistenceService} from 'charactersheet/services/common/persistence_service';
import {Proficiency} from 'charactersheet/models/character';

import template from './form.html';

export class ProficiencyFormComponentViewModel extends FormComponentViewModel {

    generateBlank = () => (new Proficiency());

    notify = () => {
        Notifications.proficiency.changed.dispatch();
    }

    // Pre-pop methods
    proficienciesPrePopFilter = (request, response) => {
        const term = request.term.toLowerCase();
        let results = [];
        if (term && term.length > 2) {
            const keys = DataRepository.proficiencies
                ? Object.keys(DataRepository.proficiencies)
                : [];
            results = keys.filter(function(name, idx, _) {
                return name.toLowerCase().indexOf(term) > -1;
            });
        }
        response(results);
    };

    populateProficiency = (label, value) => {
        var proficiency = DataRepository.proficiencies[label];
        this.currentEditItem().importValues(proficiency);
        this.shouldShowDisclaimer(true);
    };

    setType = (label, value) => {
        this.currentEditItem().type(value);
    };
}

ko.components.register('proficiency-form', {
    viewModel: ProficiencyFormComponentViewModel,
    template: template
});
