import 'select2/dist/css/select2.min.css';
import 'bin/knockout-bootstrap-modal';
import 'bin/knockout-select2';

import { Notifications } from 'charactersheet/utilities';
import { ProficiencyTypeComponentViewModel } from 'charactersheet/components/proficiency-marker';
import { Skill } from 'charactersheet/models/character';
import {FormComponentViewModel} from 'charactersheet/utilities';

import ko from 'knockout';
import template from './addForm.html';

export class SkillsAddFormViewModel extends FormComponentViewModel {

    generateBlank = () => (new Skill());

    notify = () => {
      Notifications.skills.changed.dispatch();
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

}

ko.components.register('add-skills-form', {
    viewModel: SkillsAddFormViewModel,
    template: template
});
