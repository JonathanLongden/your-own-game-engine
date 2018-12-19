export class AliasArray {
  #items;

  #aliasIdx;

  #idxAlias;

  constructor() {
    this.#items = [];
    this.#aliasIdx = {};
    this.#idxAlias = {};
  }

  add(alias, item) {
    const idx = this.#items.length;

    if (this.has(alias)) return false;

    if (Array.isArray(alias)) {
      this.#idxAlias[idx] = alias;

      for (let i = 0, l = alias.length; i < l; i += 1) {
        this.#aliasIdx[alias[i]] = idx;
      }

      this.#items.push(item);

      return true;
    }

    this.#items.push(item);
    this.#aliasIdx[alias] = idx;
    this.#idxAlias[idx] = alias;

    return true;
  }

  set(idxAlias, item) {
    if (this._hasAlias(idxAlias)) {
      this.#items[this.#aliasIdx[idxAlias]] = item;
      return;
    }

    if (this._hasIndex(idxAlias)) {
      this.#items[idxAlias] = item;
    }
  }

  remove(idxAlias) {
    if (this._hasIndex(idxAlias)) this._removeByIndex(idxAlias);
    if (this._hasAlias(idxAlias)) this._removeByAlias(idxAlias);
  }

  get(idxAlias) {
    if (this._hasIndex(idxAlias)) return this._getByIndex(idxAlias);
    if (this._hasAlias(idxAlias)) return this._getByAlias(idxAlias);
    return undefined;
  }

  has(idxAlias) {
    return this._hasIndex(idxAlias) || this._hasAlias(idxAlias);
  }

  _removeByIndex(idx) {
    this.#items.splice(idx, 1);
    const alias = this.#idxAlias[idx];

    if (Array.isArray(alias)) {
      for (let i = 0, l = alias.length; i < l; i += 1) {
        delete this.#aliasIdx[alias[i]];
      }
    } else {
      delete this.#aliasIdx[alias];
    }

    delete this.#idxAlias[idx];
  }

  _removeByAlias(alias) {
    let idx;

    if (Array.isArray(alias)) {
      for (let i = 0, l = alias.length; i < l; i += 1) {
        idx = idx || this.#aliasIdx[alias[i]];
        delete this.#aliasIdx[alias[i]];
      }
    } else {
      idx = this.#aliasIdx[alias];
      delete this.#aliasIdx[alias];
    }

    delete this.#idxAlias[idx];

    this.#items.splice(idx, 1);
  }

  _hasIndex(idx) {
    return typeof this.#items[idx] !== 'undefined';
  }

  _hasAlias(alias) {
    if (Array.isArray(alias)) {
      for (let i = 0, l = alias.length; i < l; i += 1) {
        if (this._hasAlias(alias[i])) {
          return true;
        }
      }

      return false;
    }

    return typeof this.#aliasIdx[alias] !== 'undefined';
  }

  _getByIndex(idx) {
    return this.#items[idx];
  }

  _getByAlias(alias) {
    if (Array.isArray(alias)) {
      for (let i = 0, l = alias.length; i < l; i += 1) {
        if (this._hasAlias(alias[i])) {
          return this._getByAlias(alias[i]);
        }
      }
    }

    return this.#items[this.#aliasIdx[alias]];
  }

  get items() {
    return this.#items;
  }
}

export default AliasArray;
