export default {
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  get(key) {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  },
  remove(key) {
    localStorage.removeItem(key)
  },
  getTableKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      if (!localStorage.key(i).startsWith('table_')) continue;
      keys.push(localStorage.key(i));
    }
    return keys;
  }
}
