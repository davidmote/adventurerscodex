import 'bin/knockout-circular-progress';
import {
    DeathSave,
    Health,
    HitDice,
    HitDiceType,
    Profile
} from 'charactersheet/models/character';
import { ArmorClassService } from 'charactersheet/services';
import { CharacterManager } from 'charactersheet/utilities';
import { HealthFormComponentViewModel } from './form';
import { Notifications } from 'charactersheet/utilities';
import { PersistenceService } from 'charactersheet/services/common/persistence_service';
import icon from 'images/nested-hearts.svg';
import ko from 'knockout';
import template from './index.html';


export function StatsViewModel(params) {
    var self = this;
    self.tabId = params.tabId;
    self.health = ko.observable(new Health());

    self.healInput = ko.observable(null);
    self.tempInput = ko.observable(null);
    self.dmgInput = ko.observable(null);

    self.hitDiceList = ko.observableArray([]);
    self.hitDiceType = ko.observable(new HitDiceType());
    self.deathSaveSuccessList = ko.observableArray([]);
    self.deathSaveSuccessVisible = ko.observable(true);
    self.deathSaveFailureList = ko.observableArray([]);
    self.deathSaveFailureVisible = ko.observable(true);

    self._dummy = ko.observable();
    // Wait for page load

    self.getHealthColor = () => {
        if (self.health().isDangerous()) {
            return '#e74c3c';
        } else if (self.health().isWarning()) {
            return '#f39c12';
        }
        return '#18bc9c';
    };
    self.tempHpColor = '#71D4E8';

    self.hpText = ko.computed(()=> {
        let tempHp = '';
        if (self.health().tempHitpointsRemaining()) {
            tempHp = `<span style="color: #71D4E8">+${self.health().tempHitpointsRemaining()}</span>`;
        }
        return `${self.health().regularHitpointsRemaining()} ${tempHp}<br />of&nbsp;${self.health().maxHitpoints()}&nbsp;HP`;
    });

    self.hpChart = ko.computed(()=>({
        data: {
            text: {value: self.hpText()},
            value: self.health().regularHitpointsRemaining(),
            maxValue: self.health().maxHitpoints()
        },
        config: {
            strokeWidth: 12,
            from: { color: self.getHealthColor() },
            to: { color: self.getHealthColor() },
            text: {
                className: 'lead hpChart'
            }
        }
    }));

    self.tempHpChart =  ko.computed(()=>({
        data: {
            text: null,
            value: self.health().tempHitpointsRemaining(),
            maxValue: self.health().maxHitpoints()
        },
        config: {
            trailColor: '#FFF',
            strokeWidth: 6,
            from: { color: self.tempHpColor },
            to: { color: self.tempHpColor }
        }
    }));


    self.handleHeal = function() {
        if (self.healInput()) {
            self.damageHandler(0-parseInt(self.healInput()));
        }
        self.healInput(null);
    };

    self.handleTemp = function() {
        if (self.tempInput()) {
            self.health().tempHitpoints(self.tempInput());
        }
        self.tempInput(null);
    };

    self.handleDmg = function() {
        if (self.dmgInput()) {
            self.damageHandler(self.dmgInput());
        }
        self.dmgInput(null);
    };

    self.damageHandler = ko.computed({
        read: function() {
            return self.health().damage();},
        write: function(value) {
            const currentValue = parseInt(value);
            const currentDamage = parseInt(self.health().damage());
            const currentTempHP = parseInt(self.health().tempHitpoints());
            const maxHitPoints = parseInt(self.health().maxHitpoints());
            let newDamage;
            if (value < 0) {
                newDamage = currentDamage + currentValue;
                if (newDamage < 0) {
                    newDamage = 0;
                }
            }
            else if (currentTempHP) {
                // Find the damage delta, then apply to temp hit points first.
                let remainingTempHP = currentTempHP - currentValue;
                if (remainingTempHP >= 0 ) {
                    // New damage value did not eliminate temporary hit points
                    // reduce temporary hit points, and do not apply to damage.
                    self.health().tempHitpoints(remainingTempHP);
                    newDamage = currentDamage;
                } else { // remainingTempHP is negative.
                    self.health().tempHitpoints(0);
                    newDamage = currentDamage - remainingTempHP;
                }
            }
            else {
                newDamage = currentDamage + currentValue;
            }
            if (newDamage > maxHitPoints) {
                newDamage = maxHitPoints;
            }
            self.health().damage(newDamage);

        },
        owner: self
    });

    //
    // self.oldDamageHandler = ko.computed({
    //     read: function() {
    //         return self.health().damage();},
    //     write: function(value) {
    //         console.log('dmg is', value);
    //         if (self.health().tempHitpoints()) {
    //             // Find the damage delta, then apply to temp hit points first.
    //             var damageChange = value - self.health().damage();
    //             if (damageChange > 0) {
    //                 var remainingTempHP = self.health().tempHitpoints() - damageChange;
    //                 if (remainingTempHP >= 0 ) {
    //                     // New damage value did not eliminate temporary hit points
    //                     // reduce temporary hit points, and do not apply to damage.
    //                     self.health().tempHitpoints(remainingTempHP);
    //                     value = self.health().damage();
    //                 } else { // remainingTempHP is negative.
    //                     self.health().tempHitpoints(0);
    //                     value = self.health().damage() + remainingTempHP;
    //                 }
    //             }
    //         }
    //         self.health().damage(value);
    //     },
    //     owner: self
    // });


    self.load = function() {
        Notifications.global.save.add(self.save);

        var key = CharacterManager.activeCharacter().key();
        var health = PersistenceService.findBy(Health, 'characterId', key);
        if (health.length > 0) {
            self.health(health[0]);
        } else {
            self.health(new Health());
        }
        self.health().characterId(key);

        var hitDiceList = PersistenceService.findBy(HitDice, 'characterId', key);
        if (hitDiceList.length > 0) {
            self.hitDiceList(hitDiceList);
        }
        self.hitDiceList().forEach(function(e, i, _) {
            e.characterId(key);
        });

        self.calculateHitDice();

        var hitDiceType = PersistenceService.findBy(HitDiceType, 'characterId', key);
        if(hitDiceType.length > 0){
            self.hitDiceType(hitDiceType[0]);
        }
        else {
            self.hitDiceType(new HitDiceType());
        }
        self.hitDiceType().characterId(key);

        var deathSaveList = PersistenceService.findBy(DeathSave, 'characterId', key);
        self.deathSaveSuccessList([]);
        self.deathSaveFailureList([]);

        if (deathSaveList.length === 6) {
            for (var i=0; i<3; i++) {
                self.deathSaveSuccessList.push(deathSaveList[i]);
            }
            for (var j=3; j<6; j++) {
                self.deathSaveFailureList.push(deathSaveList[j]);
            }
        } else {
            // FIXME: Purge all saves and remake...
            deathSaveList.forEach(save => {
                save.delete();
            });

            for (var k=0; k<3; k++) {
                self.deathSaveSuccessList.push(new DeathSave());
                self.deathSaveFailureList.push(new DeathSave());
            }
        }

        self.deathSaveSuccessList().forEach(function(e, i, _) {
            e.characterId(key);
        });
        self.deathSaveFailureList().forEach(function(e, i, _) {
            e.characterId(key);
        });

        //Subscriptions
        self.health().maxHitpoints.subscribe(self.maxHpDataHasChanged);
        self.health().damage.subscribe(self.damageDataHasChanged);
        self.health().tempHitpoints.subscribe(self.tempHpDataHasChanged);
        self.hitDiceList().forEach(function(hitDice, i, _) {
            hitDice.hitDiceUsed.subscribe(self.hitDiceDataHasChanged);
        });
        self.hitDiceType.subscribe(self.hitDiceTypeDataHasChanged);
        self.deathSaveFailureList().forEach(function(save, idx, _) {
            save.deathSaveFailure.subscribe(self._alertPlayerHasDied);
            save.deathSaveFailure.subscribe(self.deathSaveFailureDataHasChanged);
        });
        self.deathSaveSuccessList().forEach(function(save, idx, _) {
            save.deathSaveSuccess.subscribe(self._alertPlayerIsStable);
            save.deathSaveSuccess.subscribe(self.deathSaveSuccessDataHasChanged);
        });
        self.deathSavesVisible.subscribe(self.toggleMode);

        Notifications.events.longRest.add(self.resetOnLongRest);
        Notifications.profile.level.changed.add(self.calculateHitDice);
        self._alertPlayerHasDied();
        self._alertPlayerIsStable();
        self.healthDataHasChange();
        // self.setNewHeight();
    };

    self.save = function() {
        self.health().save();
        self.hitDiceList().forEach(function(e, i, _) {
            e.save();
        });
        self.hitDiceType().save();
        self.deathSaveSuccessList().forEach(function(e, i, _) {
            e.save();
        });
        self.deathSaveFailureList().forEach(function(e, i, _) {
            e.save();
        });
    };

    self.clear = function() {
        self.health().clear();
        self.deathSaveSuccessList().forEach(function(e, i, _) {
            e.clear();
        });
        self.deathSaveFailureList().forEach(function(e, i, _) {
            e.clear();
        });
        self.hitDiceList([]);
    };

    self.calculateHitDice = function() {
        var profile = PersistenceService.findBy(Profile, 'characterId',
            CharacterManager.activeCharacter().key())[0];

        var difference = parseInt(profile.level()) - self.hitDiceList().length;
        var pushOrPop = difference > 0 ? 'push' : 'pop';
        for (var i = 0; i < Math.abs(difference); i++) {
            var h;
            if (pushOrPop === 'push') {
                h = new HitDice();
                h.characterId(CharacterManager.activeCharacter().key());
                h.save();
                self.hitDiceList.push(h);
            } else {
                h = self.hitDiceList.pop();
                h.delete();
            }
        }
    };

    /**
     * Fired when a long rest notification is recieved.
     * Resets health and hit dice.
     */
    self.resetOnLongRest = function() {
        self.resetHitDice();
        self.health().damage(0);
        self.health().tempHitpoints(0);
        self.health().save();
        self.damageDataHasChanged();
    };

    self.resetDamage = function() {
        self.health().damage(0);
        self.health().save();
        self.damageDataHasChanged();
    };

    /**
     * Reset the hit dice to an unused state up to the floor of half of the
     * character's level.
     *
     * This will be used primarily for long rest resets.
     */
    self.resetHitDice = function() {
        var profile = PersistenceService.findBy(Profile, 'characterId',
            CharacterManager.activeCharacter().key())[0];
        var level = profile.level();
        var restoredHitDice = Math.floor(level / 2) < 1 ? 1 : Math.floor(level / 2);

        ko.utils.arrayForEach(this.hitDiceList(), function(hitDice) {
            if (hitDice.hitDiceUsed() === true) {
                if (restoredHitDice !== 0) {
                    hitDice.hitDiceUsed(false);
                    restoredHitDice -= 1;
                }
            }
        });
        self.hitDiceList().forEach(function(e, i, _) {
            e.save();
        });
        self.hitDiceDataHasChanged();
    };

    // Reset death and success saves when char drops to 0 hp
    self.resetDeathSaves = ko.computed(function() {
        self._dummy();
        if (self.health().hitpoints() >= 1){
            self.deathSaveFailureList().forEach(function(save, idx, _) {
                save.deathSaveFailure(false);
            });
            self.deathSaveSuccessList().forEach(function(save, idx, _) {
                save.deathSaveSuccess(false);
            });
        }
    });

    // Determine if death saves should be visible
    self.deathSavesVisible = ko.computed(function() {
        self._dummy();
        var allSaved = self.deathSaveSuccessList().every(function(save, idx, _) {
            return save.deathSaveSuccess();
        });
        return self.health().hitpoints() === 0 && !allSaved;
    });

    self.rip = ko.computed(() => {
        return self.deathSaveFailureList().every(function(save, idx, _) {
            return save.deathSaveFailure();
        });
    });

    self.toggleMode = () => {
        return self.deathSavesVisible();
    };
    /* Utility Methods */


    self.deathSaveSuccessDataHasChanged = function() {
        self.deathSaveSuccessList().forEach(function(save, idx, _) {
            save.save();
        });
    };

    self.deathSaveFailureDataHasChanged = function() {
        self.deathSaveFailureList().forEach(function(save, idx, _) {
            save.save();
        });
    };

    self.healthDataHasChange = function() {
        self.health().save();
        Notifications.health.changed.dispatch();
    };

    self.maxHpDataHasChanged = function() {
        self.health().save();
        Notifications.health.maxHitPoints.changed.dispatch();
        Notifications.health.changed.dispatch();
    };

    self.damageDataHasChanged = function() {
        self.health().save();
        Notifications.health.damage.changed.dispatch();
        Notifications.health.changed.dispatch();
    };

    self.tempHpDataHasChanged = function() {
        self.health().save();
        Notifications.health.tempHitPoints.changed.dispatch();
        Notifications.health.changed.dispatch();
    };

    self.hitDiceDataHasChanged = function() {
        self.hitDiceList().forEach(function(e, i, _) {
            e.save();
        });
        Notifications.hitDice.changed.dispatch();
    };

    self.hitDiceTypeDataHasChanged = function() {
        self.hitDiceType().save();
        Notifications.hitDiceType.changed.dispatch();
    };

    self._alertPlayerHasDied = function() {
        var allFailed = self.deathSaveFailureList().every(function(save, idx, _) {
            return save.deathSaveFailure();
        });
        if (allFailed) {
            Notifications.userNotification.dangerNotification.dispatch(
                'Failing all 3 death saves will do that...',
                'You have died.', {
                    timeOut: 0
                });
            Notifications.stats.deathSaves.fail.changed.dispatch();
            self.deathSaveSuccessVisible(false);
        } else {
            Notifications.stats.deathSaves.notFail.changed.dispatch();
            self.deathSaveSuccessVisible(true);
        }

    };

    self.stabilize = () => {
        self.deathSaveSuccessList().forEach(function(save, idx, _) {
            save.deathSaveSuccess(true);
        });
    };

    self._alertPlayerIsStable = function() {
        var allSaved = self.deathSaveSuccessList().every(function(save, idx, _) {
            return save.deathSaveSuccess();
        });
        if (allSaved) {
            Notifications.userNotification.successNotification.dispatch(
                'You have been spared...for now.',
                'You are now stable.', {
                    timeOut: 0
                });
            Notifications.stats.deathSaves.success.changed.dispatch();
            self.deathSaveFailureVisible(false);
        } else {
            Notifications.stats.deathSaves.notSuccess.changed.dispatch();
            self.deathSaveFailureVisible(true);
        }
    };
}

ko.components.register('stats', {
    viewModel: StatsViewModel,
    template: template
});
