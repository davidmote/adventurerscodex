import 'select2/dist/css/select2.min.css';
import 'bin/knockout-bootstrap-modal';
import 'bin/knockout-select2';
import { CharacterManager } from 'charactersheet/utilities';

import { ProficiencyTypeComponentViewModel } from 'charactersheet/components/proficiency-marker';
import { Skill } from 'charactersheet/models/character';
import { SortService } from 'charactersheet/services/common';
import ko from 'knockout';
import template from './form.html';

export class SkillsFormViewModel {
    constructor(params) {
      this.skills = params.skills;
      this.sort = params.sort;
      this.sortBy = params.sortBy;
      this.sortArrow = params.sortArrow;
      this.removeSkill = params.removeSkill;
      this.toggle = params.toggle;
      this.resize = params.resize;
    }

    proficiencyOptions = [
        'not',
        'half',
        'proficient',
        'expertise'
    ];

    formatProficiencyOptions = (choice) => {
        if (choice.id === undefined) {
            return '';
        } else if (choice.id == 'not') {
            return $('<span style="padding: 10px">No Proficiency</span>');
        }
        else if (choice.id == 'expertise') {
            return $('<span style="padding: 10px"> '+ ProficiencyTypeComponentViewModel.EXPERT_TEMPLATE + ' Expertise</span>');
        }
        else if (choice.id == 'proficient') {
            return $('<span style="padding: 10px"> '+ ProficiencyTypeComponentViewModel.NORMAL_TEMPLATE + ' Proficient</span>');
        }
        else if (choice.id == 'half') {
            return $('<span style="padding: 10px"> '+ ProficiencyTypeComponentViewModel.HALF_TEMPLATE + ' Half</span>');
        }
      else return '';
    };

    formatProficiency = (choice) => {
        if (!choice.id) {
            return '';
        }
        if (choice.id == 'expertise') {
            return $(ProficiencyTypeComponentViewModel.EXPERT_TEMPLATE);
        }
        else if (choice.id == 'proficient') {
            return $(ProficiencyTypeComponentViewModel.NORMAL_TEMPLATE);
        }
        else if (choice.id == 'half') {
            return $(ProficiencyTypeComponentViewModel.HALF_TEMPLATE);
        }
      else return '';
    };

    abilityScoreOptions = [
            {id: 'Str',
            'text': 'Strength'},
            {id: 'Dex',
            'text': 'Dexterity'},
            {id: 'Con',
            'text': 'Constitution'},
            {id: 'Int',
            'text': 'Intelligence'},
            {id: 'Wis',
            'text': 'Wisdom'},
            {id: 'Cha',
            'text': 'Charisma'}
        ];

    submitSkills = () => {
       this.toggle()
    };

    load = () => {
    };

    /**
     * Determines whether a column should have an up/down/no arrow for sorting.
     */
    sortArrow = function(columnName) {
        return SortService.sortArrow(columnName, this.sort());
    };
}

ko.components.register('skills-form', {
    viewModel: SkillsFormViewModel,
    template: template
});
