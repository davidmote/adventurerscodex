import ko from 'knockout';
import { debounce } from 'lodash';
import { Spell } from 'charactersheet/models';

import template from './spellcard.html';
/**
 * edit-button component
 * A useful component for displaying edit or save icons.
 * @param clickAction {function} a function to call on click
 * @param toggleMode {observable} Whether or not the button is toggled
 * Usage:
 */
 //
ko.bindingHandlers.spellCard = {
    init: function(element, valueAccessor, allBindingsAccessor) {
        var value = valueAccessor();
        var callback = ko.utils.unwrapObservable(value.callback);

         // $(element).collapse({
         //     toggle: false
         // });
         //
        if (callback) {
             // Register callbacks.
            $(element).on('hidden.bs.collapse', callback);
            $(element).on('shown.bs.collapse', callback);
        }
    }
};

export class SpellCardComponentViewModel {
    constructor(params) {
        this.spell = params.spell;
        this.removeSpell = params.removeSpell;
        this.editMode = ko.observable(false);
        this.elementHeight = ko.observable('auto');
        this.firstFormElementHasFocus = ko.observable(false);
        this.currentEditItem = ko.observable();

    }

    load = () => {
        $(window).on('resize', debounce(this.setNewHeight, 150));
    }

    collapseCallback = () => {
        if( this.editMode()) {
          this.editMode(false);
        }
        this.setNewHeight();
    }

    toggleEditSpell = () => {
        if(this.editMode()) {
            this.spell.importValues(this.currentEditItem().exportValues())
            this.spell.save();
            this.editMode(false);
            this.firstFormElementHasFocus(false);
            this.setNewHeight();
        } else {
            this.currentEditItem(new Spell());
            this.currentEditItem().importValues(this.spell.exportValues());
            this.editMode(true);
            this.firstFormElementHasFocus(true);
            this.setNewHeight();
        }
    }

    cancelEditSpell = () => {
      this.currentEditItem(new Spell());
      this.editMode(false);
      this.setNewHeight();
    }

    preparedRowVisibleEdit = (spell) => {
        return parseInt(spell.spellLevel()) !== 0;
    };

    setNewHeight = () => {
        let setHeight = 0;
        if (this.editMode()) {
            setHeight = $(`#spell_list_${this.spell.__id} .back`).height();
        } else {
            setHeight = $(`#spell_list_${this.spell.__id} .front`).height();
        }
        if (setHeight && setHeight > 1) {
            this.elementHeight(setHeight.toString()+'px');
        }
    }

    removeSpell = () => {
        this.removeSpell(this.spell);
    }

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
      'Always prepared spells will not count against total prepared spells.')
      ;
}

ko.components.register('spell-card', {
    viewModel: SpellCardComponentViewModel,
    template: template
});
