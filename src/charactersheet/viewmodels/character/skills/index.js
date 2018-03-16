import 'select2/dist/css/select2.min.css';
import 'bin/knockout-bootstrap-modal';
import 'bin/knockout-select2';
import {
    CharacterManager,
    Utility
} from 'charactersheet/utilities';
import { Notifications } from 'charactersheet/utilities';
import { PersistenceService } from 'charactersheet/services/common/persistence_service';
import { ProficiencyTypeComponentViewModel } from 'charactersheet/components/proficiency-marker';
import { Skill } from 'charactersheet/models/character';
import { SortService } from 'charactersheet/services/common';
import ko from 'knockout';
import template from './index.html';

export function SkillsViewModel() {
    var self = this;

    self.sorts = {
        'name asc': { field: 'name', direction: 'asc'},
        'name desc': { field: 'name', direction: 'desc'},
        'modifier asc': { field: 'modifier', direction: 'asc'},
        'modifier desc': { field: 'modifier', direction: 'desc'},
        'proficiency asc': { field: 'proficiency', direction: 'asc', booleanType: true},
        'proficiency desc': { field: 'proficiency', direction: 'desc', booleanType: true}
    };

    self._defaultSkills = function() {
        var skills = [
            { name: 'Acrobatics', abilityScore: 'Dex', proficency: false, modifier: null, proficiencyType: 'not'},
            { name: 'Animal Handling', abilityScore: 'Wis', proficency: false, modifier: null, proficiencyType: 'not'},
            { name: 'Arcana', abilityScore: 'Int', proficency: false, modifier: null, proficiencyType: 'not' },
            { name: 'Athletics', abilityScore: 'Str', proficency: false, modifier: null, proficiencyType: 'not'},
            { name: 'Deception', abilityScore: 'Cha', proficency: false, modifier: null, proficiencyType: 'not'},
            { name: 'History', abilityScore: 'Int', proficency: false, modifier: null, proficiencyType: 'not'},
            { name: 'Insight', abilityScore: 'Wis', proficency: false, modifier: null, proficiencyType: 'not'},
            { name: 'Intimidation', abilityScore: 'Cha', proficency: false, modifier: null, proficiencyType: 'not'},
            { name: 'Investigation', abilityScore: 'Int', proficency: false, modifier: null, proficiencyType: 'not'},
            { name: 'Medicine', abilityScore: 'Wis', proficency: false, modifier: null, proficiencyType: 'not'},
            { name: 'Nature', abilityScore: 'Int', proficency: false, modifier: null, proficiencyType: 'not'},
            { name: 'Perception', abilityScore: 'Wis', proficency: false, modifier: null, proficiencyType: 'not'},
            { name: 'Performance', abilityScore: 'Cha', proficency: false, modifier: null, proficiencyType: 'not'},
            { name: 'Persuasion', abilityScore: 'Cha', proficency: false, modifier: null, proficiencyType: 'not'},
            { name: 'Religion', abilityScore: 'Int', proficency: false, modifier: null, proficiencyType: 'not'},
            { name: 'Sleight of Hand', abilityScore: 'Dex', proficency: false, modifier: null, proficiencyType: 'not'},
            { name: 'Stealth', abilityScore: 'Dex', proficency: false, modifier: null, proficiencyType: 'not'},
            { name: 'Survival', abilityScore: 'Wis', proficency: false, modifier: null, proficiencyType: 'not'}
        ];
        return skills.map(function(e, i, _) {
            var skill = new Skill(self);
            e.characterId = CharacterManager.activeCharacter().key();
            skill.importValues(e);
            return skill;
        });
    };

    self.blankSkill = ko.observable(new Skill());
    self.newModalOpen = ko.observable(false);
    self.editModalOpen = ko.observable(false);
    self.editItemIndex = null;
    self.currentEditItem = ko.observable();
    self.skills = ko.observableArray([]);
    self.filter = ko.observable('');
    self.sort = ko.observable(self.sorts['name asc']);
    self.editMode = ko.observable(false);
    self.elementHeight = ko.observable('800px');
    const PANEL_ID = '#skill-panel';

    self.proficiencyOptions = [
        'not',
        'half',
        'proficient',
        'expertise'
    ];

    self.abilityScoreOptions = [
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

    self.formatProficiencyOptions = (choice) => {
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

    self.formatProficiency = (choice) => {
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

    self.setNewHeight = function () {
        let setHeight = 0;
        if (self.editMode()) {
            setHeight = $(`${PANEL_ID} .back`).height();
        } else {
            setHeight = $(`${PANEL_ID} .front`).height();
        }
        if (setHeight > 0) {
            self.elementHeight(setHeight.toString()+'px');
        }
    };
    // Wait for page load
    setTimeout(self.setNewHeight,0);

    self.editSkills = function() {
        if (self.editMode()) {
            if(self.blankSkill().name()) {
                self.addSkill();
            }
            self.dataHasChanged();
            self.editMode(false);
            self.setNewHeight();
        } else {
            self.editMode(true);
            self.setNewHeight();
        }
    };

    self.load = function() {
        Notifications.global.save.add(self.save);


        $('#add-skill').on('shown.bs.collapse', self.setNewHeight);

        $('#add-skill').on('hidden.bs.collapse', self.setNewHeight);
        var skills = PersistenceService.findBy(Skill, 'characterId',
            CharacterManager.activeCharacter().key());

        if (skills.length === 0) {
            self.skills(self._defaultSkills());
            self.skills().forEach(function(e, i, _) {
                e.save();
            });
        } else {
            self.skills(skills);
        }

        //Subscriptions
        Notifications.abilityScores.changed.add(self.dataHasChanged);
        Notifications.otherStats.proficiency.changed.add(self.dataHasChanged);
        Notifications.profile.changed.add(self.dataHasChanged);
        self.skills().forEach(function(e, i, _) {
            self.addNotifiers(e);
            if (e.name() === 'Perception'){
                e.bonus.subscribe(self.perceptionHasChanged);
            }
        });
    };

    self.dispose = function() {
        self.save();
        self.skills([]);
        Notifications.abilityScores.changed.remove(self.dataHasChanged);
        Notifications.otherStats.proficiency.changed.add(self.dataHasChanged);
        Notifications.profile.changed.remove(self.dataHasChanged);
        Notifications.global.save.remove(self.save);
    };

    self.save = function() {
        self.skills().forEach(function(e, i, _) {
            e.save();
        });
    };

    /* UI Methods */

    /**
     * Filters and sorts the skills for presentation in a table.
     */
    self.filteredAndSortedSkills = ko.computed(function() {
        return SortService.sortAndFilter(self.skills(), self.sort(), null);
    });

    /**
     * Determines whether a column should have an up/down/no arrow for sorting.
     */
    self.sortArrow = function(columnName) {
        return SortService.sortArrow(columnName, self.sort());
    };

    /**
     * Given a column name, determine the current sort type & order.
     */
    self.sortBy = function(columnName) {
        self.sort(SortService.sortForName(self.sort(),
            columnName, self.sorts));
    };

    // Edit Modal Methods

    self.editModifierHasFocus = ko.observable(false);

    self.editModalFinishedAnimating = function() {
        self.editModifierHasFocus(true);
    };

    self.editModalFinishedClosing = function() {
        if (self.editModalOpen()) {
            Utility.array.updateElement(self.skills(), self.currentEditItem(), self.editItemIndex);
        }

        self.save();
        self.skills().forEach(function(skill, idx, _) {
            skill.updateValues();
        });

        self.editModalOpen(false);
    };

    // New Modal Methods

    self.newSkillFieldHasFocus = ko.observable(false);

    self.newModalFinishedAnimating = function() {
        self.newSkillFieldHasFocus(true);
    };

    self.newModalFinishedClosing = function() {
        self.newModalOpen(false);
    };

    //Manipulating skills

    self.addSkill = function() {
        var skill = self.blankSkill();
        skill.characterId(CharacterManager.activeCharacter().key());
        skill.save();
        self.addNotifiers(skill);
        self.skills.push(skill);
        self.blankSkill(new Skill());
    };

    self.cancelAddSkill = () => {
        $('#add-skill').collapse('hide');
        self.blankSkill(new Skill());
    };

    self.removeSkill = function(skill) {
        self.skills.remove(skill);
        skill.delete();
    };

    self.editSkill = function(skill) {
        self.editItemIndex = skill.__id;
        self.currentEditItem(new Skill());
        self.currentEditItem().importValues(skill.exportValues());
        self.editModalOpen(true);
    };

    self.clear = function() {
        self.skills().forEach(function(e, i, _) {
            self.removeSkill(e);
        });
    };

    /**
     * Given a skill, tell it to alert the Notifications of changes to itself.
     */
    self.addNotifiers = function(skill) {
        var savefn = function() {
            skill.save();
            Notifications.skills.changed.dispatch();
        };
        skill.name.subscribe(savefn);
        skill.bonus.subscribe(savefn);
    };

    self.dataHasChanged = function() {
        self.skills().forEach(function(e, i, _) {
            e.updateValues();
        });
        Notifications.skills.changed.dispatch();
    };

    self.perceptionHasChanged = function() {
        Notifications.skills.perception.changed.dispatch();
    };
}

ko.components.register('skills', {
    viewModel: SkillsViewModel,
    template: template
});
