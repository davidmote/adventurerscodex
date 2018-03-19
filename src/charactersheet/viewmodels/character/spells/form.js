import ko from 'knockout';
import { debounce } from 'lodash';
import {
    CharacterManager,
    DataRepository,
    Notifications,
    Utility
} from 'charactersheet/utilities';
import { Spell } from 'charactersheet/models';

import template from './form.html';


export class SpellFormComponentViewModel {
    constructor(params) {
        this.data = params.data;
        this.showForm = params.showForm;
        this.toggle = params.toggle;
        this.addCallback = params.add;
        this.remove = params.remove;

        this.containerId = ko.utils.unwrapObservable(params.containerId);
        this.currentEditItem = ko.observable();
        this.formElementHasFocus = ko.observable(false);
        this.addForm = ko.observable(false);
        this.bypassUpdate = ko.observable(false);
        this.shouldShowDisclaimer = ko.observable(false);

    }

    load = () => {
        this.currentEditItem(new Spell());
        if (this.data) {
            this.currentEditItem().importValues(this.data.exportValues());
        } else {
            this.addForm(true);
        }

        this.showForm.subscribe(() => {
            if (this.showForm()) {
                if (this.data) {
                    this.currentEditItem(new Spell());
                    this.currentEditItem().importValues(this.data.exportValues());
                }
                this.formElementHasFocus(true);
            } else {
                this.formElementHasFocus(false);
                if (this.bypassUpdate()) {
                    this.bypassUpdate(false);
                } else {
                    this.update();
                    this.currentEditItem(new Spell());
                }
            }
        });
    }

    update = () => {
        if (this.data) {
            this.data.importValues(this.currentEditItem().exportValues());
            this.data.save();
        } else {
            this.addCallback(this.currentEditItem())
        }
    }

    save = () => {
        this.bypassUpdate(true);
        this.update();
        this.toggle();
        this.shouldShowDisclaimer(false);
        this.currentEditItem(new Spell());
    }

    cancel = (data, event) => {
        this.bypassUpdate(true);
        this.toggle();
        this.shouldShowDisclaimer(false);
        this.currentEditItem(new Spell());
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
            const keys = DataRepository.spells ? Object.keys(DataRepository.spells) : [];
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

    alwaysPreparedPopoverText = () => (
      'Always prepared spells will not count against total prepared spells.');
}

ko.components.register('spell-form', {
    viewModel: SpellFormComponentViewModel,
    template: template
});
