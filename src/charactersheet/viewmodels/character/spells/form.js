import ko from 'knockout';
import {debounce} from 'lodash';
import {CharacterManager, DataRepository, Notifications, Utility} from 'charactersheet/utilities';
import {FormComponentViewModel} from 'charactersheet/utilities';
import {Spell} from 'charactersheet/models';

import template from './form.html';

export class SpellFormComponentViewModel extends FormComponentViewModel {

    generateBlank = () => (new Spell());

    notify = () => {
        // TODO: are there any spell notifications?
        // Notifications.spells.changed.dispatch();
    }

    preparedRowVisibleEdit = () => {
        return parseInt(this.currentEditItem().spellLevel()) !== 0;
    };

    removeSpell = () => {
        this.remove(this.data);
    }

    spellsPrePopFilter = (request, response) => {
        var term = request.term.toLowerCase();
        let results = [];
        if (term && term.length > 2) {
            const keys = DataRepository.spells
                ? Object.keys(DataRepository.spells)
                : [];
            results = keys.filter(function(name, idx, _) {
                return name.toLowerCase().indexOf(term) > -1;
            });
        }
        response(results);
    };

    delayedSpellsPrePopFilter = debounce(this.spellsPrePopFilter, 350);

    populateSpell = (label, value) => {
        var spell = DataRepository.spells[label];
        this.currentEditItem().importValues(spell);
        this.shouldShowDisclaimer(true);
    };

    setSpellSchool = (label, value) => {
        this.currentEditItem().spellSchool(value);
    }

    setSpellType = (label, value) => {
        this.currentEditItem().spellType(value);
    }

    setSpellSaveAttr = (label, value) => {
        this.currentEditItem().spellSaveAttr(value);
    }

    setSpellCastingTime = (label, value) => {
        this.currentEditItem().spellCastingTime(value);
    }

    setSpellRange = (label, value) => {
        this.currentEditItem().spellRange(value);
    }

    setSpellComponents = (label, value) => {
        this.currentEditItem().spellComponents(value);
    }

    setSpellDuration = (label, value) => {
        this.currentEditItem().spellDuration(value);
    }

    alwaysPreparedPopoverText = () => ('Always prepared spells will not count against total prepared spells.');
}

ko.components.register('spell-form', {
    viewModel: SpellFormComponentViewModel,
    template: template
});
