import 'bin/popover_bind';
import 'select2/dist/css/select2.min.css';
import 'bin/knockout-select2';

import { filter, find } from 'lodash';
import { AbstractGridFormModel } from 'charactersheet/viewmodels/abstract';
import { Notifications } from 'charactersheet/utilities';
import { ProficiencyTypeComponentViewModel } from 'charactersheet/components/proficiency-marker';
import { Skill } from 'charactersheet/models/character';
import { SkillsAddFormViewModel } from './addForm';

import autoBind from 'auto-bind';
import ko from 'knockout';
import template from './form.html';

export class SkillsFormViewModel extends AbstractGridFormModel {
    constructor(params) {
        super(params);
        this.addFormId = '#add-skill';
        autoBind(this);
    }

    sorts() {
        return {
            ...super.sorts(),
            'modifier asc': {
                field: 'modifier',
                direction: 'asc'
            },
            'modifier desc': {
                field: 'modifier',
                direction: 'desc'
            },
            'proficiency asc': {
                field: 'proficiency',
                direction: 'asc',
                booleanType: true
            },
            'proficiency desc': {
                field: 'proficiency',
                direction: 'desc',
                booleanType: true
            }
        };
    }

    modelClass () {
        return Skill;
    }

    setUpSubscriptions () {
        super.setUpSubscriptions();
        Notifications.abilityScores.changed.add(this.updateAbilityScoreValues);
    }

    async updateAbilityScoreValues (abilityScore) {
        if (abilityScore) {
            const skillUpdates = filter(
          this.entities(),
          (skill) => {
              return skill.abilityScore().uuid() === abilityScore.uuid();
          } ).map(async (skill) => {
              const updatedSkill = await skill.updateAbilityScoreValues(abilityScore);
              this.replaceInList(skill);
          });
            await Promise.all(skillUpdates);
        }
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
        } else if (choice.id == 'expertise') {
            return $(`<span style="padding: 10px">${ProficiencyTypeComponentViewModel.EXPERT_TEMPLATE} Expertise</span>`);
        } else if (choice.id == 'proficient') {
            return $(`<span style="padding: 10px">${ProficiencyTypeComponentViewModel.NORMAL_TEMPLATE} Proficient</span>`);
        } else if (choice.id == 'half') {
            return $(`<span style="padding: 10px">${ProficiencyTypeComponentViewModel.HALF_TEMPLATE} Half</span>`);
        } else return '';
    };

    formatProficiency = (choice) => {
        if (!choice.id) {
            return '';
        }
        if (choice.id == 'expertise') {
            return $(ProficiencyTypeComponentViewModel.EXPERT_TEMPLATE);
        } else if (choice.id == 'proficient') {
            return $(ProficiencyTypeComponentViewModel.NORMAL_TEMPLATE);
        } else if (choice.id == 'half') {
            return $(ProficiencyTypeComponentViewModel.HALF_TEMPLATE);
        } else return '';
    };

    flipAndCollapse = () => {
        this.addForm(false);
        this.flip();
    }

    validation = {
        ...Skill.validationConstraints.rules
    };
}

ko.components.register('skills-form-view', {
    viewModel: SkillsFormViewModel,
    template: template
});
