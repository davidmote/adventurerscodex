import 'select2/dist/css/select2.min.css';
import 'bin/knockout-bootstrap-modal';
import 'bin/knockout-select2';
import { CharacterManager } from 'charactersheet/utilities';
import { Notifications } from 'charactersheet/utilities';
import { PersistenceService } from 'charactersheet/services/common/persistence_service';
import { ProficiencyTypeComponentViewModel } from 'charactersheet/components/proficiency-marker';
import { Skill } from 'charactersheet/models/character';

import ko from 'knockout';
import template from './addForm.html';

export class SkillsAddFormViewModel {
    constructor(params) {
      this.skills = params.skills;
      this.blankSkill = ko.observable(new Skill());
      this.sort = params.sort;
      this.sortBy = params.sortBy;
      this.sortArrow = params.sortArrow;
      this.removeSkill = params.removeSkill;
      this.toggle = params.toggle;
      this.resize = params.resize;
      this.add = params.addCallback;
      this.newSkillFieldHasFocus = ko.observable(false);
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


    load = () => {

        // Notifications.global.save.add(this.save);
        $('#add-skill').on('shown.bs.collapse', () => {
          this.resize();
          this.newSkillFieldHasFocus(true);
        }
          );
        $('#add-skill').on('hidden.bs.collapse', () => {
          this.resize();
          this.newSkillFieldHasFocus(false);
        });

    };

    //Manipulating skills

    addSkill = function() {
        var skill = this.blankSkill();
        skill.characterId(CharacterManager.activeCharacter().key());
        skill.save();
        this.add(skill);
        this.resize();
        this.blankSkill(new Skill());
    };

    cancelAddSkill = () => {
        $('#add-skill').collapse('hide');
        this.blankSkill(new Skill());
    };
}

ko.components.register('add-skills-form', {
    viewModel: SkillsAddFormViewModel,
    template: template
});
