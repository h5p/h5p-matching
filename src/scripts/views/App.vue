<template>
  <div
      role="region"
      :class="matchingClasses"
      @click="keyboardMode = false"
      @keyup="keyboardMode = true">
    <h3 class="h5p-matching-title" v-html="title"></h3>

    <div class="h5p-choice-lists">
      <!-- Source choice list-->
      <choice-list
          ref="source"
          listName="source"
          v-bind:otherList="targetList"
          v-bind:choice-type="choiceType"
          v-bind:i18n="i18n">
      </choice-list>

      <!-- Target choice list -->
      <choice-list
          ref="target"
          listName="target"
          v-bind:otherList="sourceList"
          choice-type="text"
          v-bind:i18n="i18n">
      </choice-list>
    </div>

    <!-- Score bar -->
    <div ref="scoreBar" class="score-bar" v-show="state !== 'default'"></div>

    <div class="h5p-question-buttons" v-if="state !== 'global-show-solution'">
      <!-- Check button -->
      <button
          ref="showResultsButton"
          v-if="state === 'default'"
          class="h5p-question-check-answer h5p-joubelui-button"
          @click="showResults"
          @keyup.enter="showResults"
          @keyup.space="showResults">
        {{i18n.checkAnswer}}
      </button>

      <!-- Show solution button -->
      <button
          ref="showSolutionButton"
          v-if="displayShowSolutionButton(state)"
          class="h5p-question-show-solution h5p-joubelui-button"
          @click="showSolution"
          @keyup.enter="showSolution"
          @keyup.space="showSolution">
        {{i18n.showSolutionButton}}
      </button>

      <!-- Retry button -->
      <button
          ref="retryButton"
          v-if="displayRetrySolutionButton(state)"
          class="h5p-question-try-again h5p-joubelui-button"
          @click="retry"
          @keyup.enter="retry"
          @keyup.space="retry">
        {{i18n.tryAgain}}
      </button>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue';
  import choiceList from './ChoiceList.vue';
  import shuffle from 'shuffle-array';
  import appState from '../components/app-state';
  import pairState from '../components/pair-state';
  import listSide from '../components/choice-list-name';
  import choiceListName from '../components/choice-list-name';
  import { jQuery as $, JoubelScoreBar } from '../components/globals';
  import { switchArrayElements, forEachDelayed, mapIndexed } from '../components/array-utils';
  import { all, assoc, equals, forEach, map, prop, range } from 'ramda';

  const refocus = () => {
    Vue.nextTick(() => {
      const element = document.activeElement;

      if(element) {
        element.blur();
        element.focus();
      }
    });
  };

  /**
   * Vue configuration
   */
  export default {
    components: { choiceList },
    data: () => ({
      sourceList: [],
      targetList: [],
      pairsLength: undefined,
      title: 'Combine the data',
      i18n: {},
      state: appState.DEFAULT,
      choiceType: 'text',
      enableRetry: true,
      enableSolutionsButton: true,
      keyboardMode: false,
    }),

    methods: {
      /**
       * Returns true if the "Show solutions" button should be displayed
       */
      displayShowSolutionButton: function(state) {
        return this.enableSolutionsButton
          && state !== appState.DEFAULT
          && state !== appState.SHOW_SOLUTION
          && !this.isAllPairsCorrect();
      },

      /**
       * Returns true if the retry button should be displayed
       * @return {boolean}
       */
      displayRetrySolutionButton: function(state) {
        return this.enableRetry
          && (state !== appState.DEFAULT && !this.isAllPairsCorrect())
          || state === appState.SHOW_SOLUTION;
      },

      /**
       * Returns true if both sides has a selected choice
       * @return {boolean}
       */
      isBothSidesSelected: function() {
        return this.$refs.source.hasSelected()
          && this.$refs.target.hasSelected();
      },

      /**
       * Returns true if the pair at an index is matched
       *
       * @param {number} index
       * @return {boolean}
       */
      isMatched: function(index) {
        return index !== undefined
          && this.$refs.source.getState(index) === pairState.MATCHED
          && this.$refs.target.getState(index) === pairState.MATCHED;
      },

      /**
       * Handle click on choice
       */
      handleSelected: function(current, other) {
        const index = current.getSelectedIndex();
        const isSelectable = this.state === appState.DEFAULT;

        // undo match
        if (isSelectable && this.isMatched(index)) {
          this.forEachSide((side) => {
            side.setState(index, pairState.NONE);
            side.unsetSelectedIndex();
          });
          refocus();
        }
        // do match
        else if(isSelectable && this.isBothSidesSelected()) {
          if(other.selectedIndex !== current.selectedIndex) {
            switchArrayElements(other.list, other.selectedIndex, current.selectedIndex);
            other.selectedIndex = current.selectedIndex;
          }

          // set sides to matched
          this.forEachSide((side) => {
            side.setSelectedChoiceState(pairState.MATCHED);
            side.unsetSelectedIndex();
          });

          refocus();
        }
      },

      /**
       * Displays the results and updates the score bar
       */
      showResults: function() {
        this.state = appState.CHECK_RESULT;

        forEachDelayed(this.range(), index => {
          const stillCheckingResults = this.state === appState.CHECK_RESULT;

          if (stillCheckingResults) {
            const isCorrect = this.isPairCorrect(index);
            const state = isCorrect ? pairState.SUCCESS : pairState.FAILURE;

            this.forEachSide(side => side.setState(index, state));
          }
        }, 100);

        this.updateScoreBar();
        this.$emit('answered', {
          pairs: this.getPairs()
        });

        Vue.nextTick(() => {
          const button = this.$refs.retryButton;
          if(button) {
            button.focus()
          }
        });
      },

      /**
       * Returns answers in pairs
       *
       * @return {Pair[]}
       */
      getPairs: function () {
        return this.range().map(index => ({
          [choiceListName.SOURCE]: this.$refs.source.list[index],
          [choiceListName.TARGET]: this.$refs.target.list[index],
        }));
      },

      /**
       * Returns true if all pairs are correct
       *
       * @return {boolean}
       */
      isAllPairsCorrect: function() {
        return all(equals(true), this.range().map(index => this.isPairCorrect(index)));
      },

      /**
       * Returns true if the pair at an index is correct
       * @param {number} index
       * @return {boolean}
       */
      isPairCorrect: function(index) {
        const sourceChoice = this.$refs.source.list[index];
        const targetChoice = this.$refs.target.list[index];

        return equals(sourceChoice.id, targetChoice.id);
      },

      /**
       * Displays the solution, and sets the view in a new state
       */
      showSolution: function () {
        const sourceList = this.$refs.source.list;

        sourceList.forEach((choice, index) => {
          if(choice.state !== pairState.SUCCESS) {
            const otherIndex = this.$refs.target.getIndexById(choice.id);

            switchArrayElements(this.$refs.target.list, index, otherIndex);

            // apply show solution to both lists on THIS index
            this.forEachSide(side => side.setState(index ,pairState.SHOW_SOLUTION))
          }
        });

        this.state = appState.SHOW_SOLUTION;
        Vue.nextTick(() => this.$refs.retryButton.focus());
      },

      /**
       * Resets the state to the initial state
       */
      retry: function () {
        this.range().forEach(index => {
          this.$refs.source.setState(index, pairState.NONE);
          this.$refs.target.setState(index, pairState.NONE);
        });

        this.forEachSide(side => {
          side.unsetSelectedIndex();
          side.list = shuffle(side.list);
        });

        this.state = appState.DEFAULT;
        Vue.nextTick(() => this.$refs.source.$el.querySelector('[tabindex="0"]').focus());
      },

      /**
       * Calls the callback function on both ChoiceLists
       *
       * @param {function} callback
       */
      forEachSide: function(callback) {
        forEach(callback, [this.$refs.source, this.$refs.target]);
      },

      /**
       *
       */
      getCurrentState: function() {
        return {
          source: this.$refs.source.getCurrentState(),
          target: this.$refs.target.getCurrentState()
        }
      },

      /**
       * Returns true if the user has started answering
       * @return {boolean}
       */
      getAnswerGiven: function() {
        return this.$refs.source.list
          .some(choice => choice.state !== pairState.NONE)
      },

      /**
       * Returns the current score
       * @return {number}
       */
      getScore: function() {
        return this.range().reduce((sum, index) => sum + (this.isPairCorrect(index) ? 1 : 0), 0);
      },

      /**
       * Initializes the scorebar if it doesn't exist
       * @param {number} maxScore
       */
      initScoreBar: function(maxScore) {
        if (!this.scoreBar) {
          this.scoreBar = new JoubelScoreBar(maxScore);
          this.scoreBar.appendTo($(this.$refs.scoreBar));
        }
      },

      /**
       * Updates the scorebar
       */
      updateScoreBar: function() {
        this.scoreBar.setScore(this.getScore());
      },

      /**
       * Returns a range with indexes for choice lists
       * Example: [0, 1, 2, 3]
       * @return {number[]}
       */
      range: function() {
        return range(0, this.pairsLength);
      },

      /**
       * Sets the droppableIndex attribute on a list
       * @param {number} index
       * @param {number} otherIndex
       * @param {choiceListName} listName
       */
      setDroppable: function(index, otherIndex, listName) {
        const otherName = this.otherChoiceListName(listName);
        const bothUnmatched = [
          this.$refs[listName].list[index].state,
          this.$refs[otherName].list[otherIndex].state
        ].every(state => equals(pairState.NONE, state));

        if (bothUnmatched) {
          this.$refs[otherName].droppableIndex = otherIndex;
        }
      },

      /**
       * Makes a match when a Choice is dropped
       * @param {number} index
       * @param {number} otherIndex
       * @param {choiceListName} listName
       */
      performDropMatch: function(index, otherIndex, listName) {
        const otherName = this.otherChoiceListName(listName);
        const hasIndexes = [index, otherIndex].every(num => num !== undefined);

        if (hasIndexes) {
          this.$refs[otherName].droppableIndex = undefined;
          switchArrayElements(this.$refs[listName].list, index, otherIndex);
          this.forEachSide(side => side.setState(otherIndex, pairState.MATCHED));
        }
      },

      /**
       * Returns the other choice list name from the given one
       *
       * @param {choiceListName} name
       * @return {choiceListName}
       */
      otherChoiceListName: function(name) {
        return (name === choiceListName.SOURCE)
          ? choiceListName.TARGET
          : choiceListName.SOURCE;
      }
    },

    watch: {
      sourceList: function (list) {
        this.$refs.source.list = list;
      },

      targetList: function (list) {
        this.$refs.target.list = list;
      },

      pairsLength: function(maxScore){
        this.initScoreBar(maxScore);
      }
    },

    mounted: function(){
      this.$refs.source.$on('select', () => {
        this.handleSelected(this.$refs.source, this.$refs.target);
        this.$emit('interacted');
      });

      this.$refs.target.$on('select', () => {
        this.handleSelected(this.$refs.target, this.$refs.source);
        this.$emit('interacted');
      });

      this.$refs.source.$on('draggable', ({ index, otherIndex }) => {
        this.setDroppable(index, otherIndex, choiceListName.SOURCE);
      });

      this.$refs.target.$on('draggable', ({ index, otherIndex }) => {
        this.setDroppable(index, otherIndex, choiceListName.TARGET);
      });

      this.$refs.source.$on('dragEnd', ({ index }) => {
        this.performDropMatch(index, this.$refs.target.droppableIndex, choiceListName.SOURCE);
        this.$emit('interacted');
      });

      this.$refs.target.$on('dragEnd', ({ index }) => {
        this.performDropMatch(index, this.$refs.source.droppableIndex, choiceListName.TARGET);
        this.$emit('interacted');
      });
    },

    computed: {
      matchingClasses: function() {
        return {
          'h5p-matching': true,
          [`h5p-matching-${this.choiceType}`]: true,
          'h5p-matching-keyboard': this.keyboardMode
        };
      }
    }
  }
</script>

<style lang="scss" type="text/scss">
  @import '../../styles/variables';

  .h5p-matching {
    padding: 1em;

    button:focus,
    [role="button"]:focus {
      outline: none;
    }

    &.h5p-matching-keyboard {
      button:focus,
      [role="button"]:focus {
        outline: 2px solid #179fff;
        outline-offset: 3px;
      }
    }

    .hidden {
      display: none;
    }

    .h5p-choice-lists {
      margin-right: auto;
      display: flex;
    }

    &.h5p-matching-image .h5p-choice-lists {
      max-width: ($width-component / 2) + $choice-height + $choice-padding;
    }

    &.h5p-matching-text .h5p-choice-lists {
      max-width: $width-component;
    }

    .h5p-text-choice-list {
      flex: 1;
    }

    .h5p-choice-list-source {
      .h5p-choice.h5p-text-choice,
      .h5p-choice.h5p-image-choice {
        border-radius: $border-radius-choice 0 0 $border-radius-choice;
        border-right: 0;
      }

      .h5p-choice-selected,
      .h5p-choice-success,
      .h5p-choice-failure,
      .h5p-choice-matched,
      .h5p-choice-show-solution {
        transform: translateX($element-displacement);
      }
    }

    .h5p-choice-list-target {
      .h5p-choice {
        border-radius: 0 $border-radius-choice $border-radius-choice 0;
        transform: translateX($element-displacement);

        &.h5p-text-choice {
          border-left-color: transparent;
        }
      }

      .h5p-choice-selected,
      .h5p-choice-success,
      .h5p-choice-failure,
      .h5p-choice-matched,
      .h5p-choice-show-solution {
        padding-left: 2.2em;
        transform: translateX(0);
      }
    }

    .score-bar {
      margin-bottom: 1em;
    }

    .h5p-question-buttons .h5p-joubelui-button:first-child {
      margin-left: 0;
    }
  }
</style>