import Events from './Events';
import PageStateManager from './PageStateManager';
import Dispatcher from '../../event/Dispatcher';

const MAX_HISTORY_LIMIT = 10;

/**
 * The implementation of the {@linkcode PageStateManager} interface.
 */
export default class PageStateManagerImpl extends PageStateManager {
  static get $dependencies() {
    return [Dispatcher];
  }

  /**
   * Initializes the page state manager.
   *
   * @param {Dispatcher} dispatcher Dispatcher fires events to app.
   */
  constructor(dispatcher) {
    super();

    /**
     * @type {Object<string, *>[]}
     */
    this._states = [];

    /**
     * @type {Object<string, *>[]}
     */
    this._statePatchQueue = [];

    /**
     * @type {number}
     */
    this._cursor = -1;

    /**
     * @type {?function(Object<string, *>)}
     */
    this.onChange = null;

    /**
     * @type {Dispatcher}
     */
    this._dispatcher = dispatcher;

    /**
     * @type {boolean}
     */
    this._ongoingTransaction = false;
  }

  /**
   * @inheritdoc
   */
  clear() {
    this._states = [];
    this._cursor = -1;
  }

  /**
   * @inheritdoc
   */
  setState(patchState) {
    if (this._ongoingTransaction) {
      return this._statePatchQueue.push(patchState);
    }

    const oldState = this.getState();
    const newState = Object.assign({}, this.getState(), patchState);

    if (this._dispatcher) {
      this._dispatcher.fire(
        Events.BEFORE_CHANGE_STATE,
        { newState, oldState, patchState },
        true
      );
    }

    this._eraseExcessHistory();
    this._pushToHistory(newState);
    this._callOnChangeCallback(newState);
  }

  /**
   * @inheritdoc
   */
  getState() {
    return this._states[this._cursor] || {};
  }

  /**
   * @inheritdoc
   */
  getAllStates() {
    return this._states;
  }

  /**
   * @inheritdoc
   */
  getTransactionStatePatches() {
    return this._statePatchQueue;
  }

  /**
   * @inheritdoc
   */
  beginTransaction() {
    if ($Debug && this._ongoingTransaction) {
      console.warn(
        'ima.core.page.state.PageStateManagerImpl.beginTransaction():' +
          'Another state transaction is already in progress. Check you workflow.' +
          'These uncommited state changes will be lost:',
        this._statePatchQueue
      );
    }

    this._ongoingTransaction = true;
    this._statePatchQueue = [];
  }

  /**
   * @inheritdoc
   */
  commitTransaction() {
    if ($Debug && !this._ongoingTransaction) {
      console.warn(
        'ima.core.page.state.PageStateManagerImpl.commitTransaction():' +
          'No transaction is in progress. Check you workflow.'
      );
    }

    if (this._statePatchQueue.length === 0) {
      this._ongoingTransaction = false;

      return;
    }

    const finalPatch = Object.assign({}, ...this._statePatchQueue);

    this._ongoingTransaction = false;
    this._statePatchQueue = [];

    this.setState(finalPatch);
  }

  /**
   * @inheritdoc
   */
  cancelTransaction() {
    this._ongoingTransaction = false;
    this._statePatchQueue = [];
  }

  /**
   * Erase the oldest state from storage only if it exceed max
   * defined size of history.
   */
  _eraseExcessHistory() {
    if (this._states.length > MAX_HISTORY_LIMIT) {
      this._states.shift();
      this._cursor -= 1;
    }
  }

  /**
   * Push new state to history storage.
   *
   * @param {Object<string, *>} newState
   */
  _pushToHistory(newState) {
    this._states.push(newState);
    this._cursor += 1;
  }

  /**
   * Call registered callback function on (@codelink onChange) with newState.
   *
   * @param {Object<string, *>} newState
   */
  _callOnChangeCallback(newState) {
    if (this.onChange && typeof this.onChange === 'function') {
      this.onChange(newState);
    }

    if (this._dispatcher) {
      this._dispatcher.fire(Events.AFTER_CHANGE_STATE, { newState }, true);
    }
  }
}
